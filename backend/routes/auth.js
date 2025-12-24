const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateRegistration, validateLogin, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// In-memory user storage (for testing only)
let users = [];

// Register a new user
router.post('/register', validateRegistration, handleValidationErrors, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      credits: 100, // Starting credits
      role: 'user',
      createdAt: new Date(),
      lastLogin: null
    };
    
    users.push(user);
    
    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user.id, username: user.username, email: user.email, credits: user.credits }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login user
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Update last login time
    user.lastLogin = new Date();
    
    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
    
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email, credits: user.credits }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile
router.get('/profile', (req, res) => {
  // Extract token from header (simplified for this example)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      id: user.id, 
      username: user.username, 
      email: user.email, 
      credits: user.credits,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
});

// Logout user (client-side token removal)
router.post('/logout', (req, res) => {
  // In a real application, you might want to add the token to a blacklist
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;