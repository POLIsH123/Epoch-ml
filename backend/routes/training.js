const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { validateTraining, handleValidationErrors } = require('../middleware/validation');
const TrainingSession = require('../models/TrainingSession');
const User = require('../models/User');
const Model = require('../models/Model');

const router = express.Router();

// Start a new training session
router.post('/start', authenticateToken, validateTraining, handleValidationErrors, async (req, res) => {
  try {
    const { modelId, parameters } = req.body;
    
    // Verify user has sufficient credits
    const user = await User.findById(req.user.userId);
    if (user.credits < 10) { // Minimum cost for training
      return res.status(400).json({ error: 'Insufficient credits' });
    }
    
    // Get model details
    const model = await Model.findById(modelId);
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    // Create training session
    const trainingSession = new TrainingSession({
      userId: req.user.userId,
      modelId,
      parameters,
      status: 'pending',
      cost: 10 // Base cost
    });
    
    await trainingSession.save();
    
    // Deduct credits from user
    user.credits -= trainingSession.cost;
    await user.save();
    
    // TODO: Start actual training process in background
    // For now, simulate training process
    simulateTraining(trainingSession._id);
    
    res.status(201).json(trainingSession);
  
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get training session by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const session = await TrainingSession.findById(req.params.id)
      .populate('userId', 'username email')
      .populate('modelId', 'name type');
    
    if (!session) {
      return res.status(404).json({ error: 'Training session not found' });
    }
    
    // Only allow user to access their own sessions
    if (session.userId._id.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all training sessions for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const sessions = await TrainingSession.find({ userId: req.user.userId })
      .populate('modelId', 'name type')
      .sort({ createdAt: -1 });
    
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simulate training process
const simulateTraining = async (sessionId) => {
  try {
    // Update status to running
    await TrainingSession.findByIdAndUpdate(sessionId, { status: 'running' });
    
    // Simulate training progress
    for (let progress = 10; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      await TrainingSession.findByIdAndUpdate(sessionId, { progress });
    }
    
    // Mark as completed
    await TrainingSession.findByIdAndUpdate(sessionId, { 
      status: 'completed',
      completedAt: new Date()
    });
    
  } catch (error) {
    console.error('Training simulation error:', error);
    await TrainingSession.findByIdAndUpdate(sessionId, { status: 'failed' });
  }
};

module.exports = router;
