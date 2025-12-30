const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Model = require('../models/Model');
const TrainingSession = require('../models/TrainingSession');
const { activeTrainingProcesses } = require('../utils/trainingProcesses');

const router = express.Router();

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
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      credits: user.credits,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

    // Update user
    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      credits: user.credits,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user account (and all associated data)
router.delete('/:id', async (req, res) => {
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

    // Check if the user ID matches the authenticated user
    if (user._id.toString() !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this account' });
    }

    // Find all training sessions for this user to terminate any active processes
    const userTrainingSessions = await TrainingSession.find({ 
      userId: user._id.toString(),
      status: { $in: ['queued', 'running'] } 
    });

    // Terminate any active training processes
    userTrainingSessions.forEach(session => {
      const processId = session._id.toString();
      const process = activeTrainingProcesses.get(processId);
      if (process) {
        process.kill(); // Terminate the process
        activeTrainingProcesses.delete(processId); // Remove from map
      }
    });

    // Delete all models created by this user
    await Model.deleteMany({ createdBy: user._id });

    // Delete all training sessions for this user
    await TrainingSession.deleteMany({ userId: user._id.toString() });

    // Finally, delete the user account
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'Account and all associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (admin only) - placeholder
router.get('/', (req, res) => {
  // For now, return a simple message
  res.json({ message: 'User listing endpoint' });
});

module.exports = router;