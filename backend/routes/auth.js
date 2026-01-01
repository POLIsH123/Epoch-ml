const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      credits: 100 // Start new users with 100 credits
    });

    await user.save();

    // Create token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    // Update user with token
    user.token = token;
    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        credits: user.credits
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    // Update user with token
    user.token = token;
    await user.save();

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        credits: user.credits
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user info (/me endpoint for frontend compatibility)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

    // Find user by ID
    const user = await User.findById(decoded.userId).select('-password -token');
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      credits: user.credits,
      role: user.role || 'user'
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

    // Find user by ID
    const user = await User.findById(decoded.userId).select('-password -token');
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({
      username: user.username,
      email: user.email,
      credits: user.credits,
      role: user.role || 'user',
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

    // Find user by ID
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { username, email } = req.body;

    // Check if new username or email already exists for other users
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      user.email = email;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        credits: user.credits
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Top up credits
router.post('/profile/topup', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    const user = await User.findById(decoded.userId);
    user.credits += 500;
    await user.save();
    res.json({ message: 'Credits added', credits: user.credits });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Forgot password - send reset link
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If an account with this email exists, a password reset link has been sent.' });
    }

    // Create a reset token (simple version - in production, use crypto.randomBytes)
    const resetToken = jwt.sign(
      { userId: user._id, type: 'password_reset' },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '1h' }
    );

    // In a real implementation, you would send an email with this token
    // For now, we'll return the reset URL in the response (for testing)
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

    console.log(`Password reset URL for ${email}: ${resetUrl}`);

    res.json({
      message: 'If an account with this email exists, a password reset link has been sent.',
      // Remove this in production - only for testing
      resetUrl: resetUrl
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    } catch (error) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;

    // Clear any existing token
    user.token = undefined;

    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user account
router.delete('/delete-account', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

    // Find user by ID and delete
    const user = await User.findByIdAndDelete(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    res.json({
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;