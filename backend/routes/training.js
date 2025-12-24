const express = require('express');
const { validateTraining, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// In-memory training sessions storage (for testing only)
let trainingSessions = [];
let users = []; // Reference to users from auth

// Start a new training session
router.post('/start', validateTraining, handleValidationErrors, (req, res) => {
  try {
    const { modelId, parameters } = req.body;
    
    // In a real implementation, we would validate the user token
    // For this test version, we'll just create a session
    
    // Create training session
    const trainingSession = {
      _id: Date.now().toString(),
      userId: 'test-user-id', // Would come from token in real implementation
      modelId,
      parameters,
      status: 'pending',
      progress: 0,
      cost: 10, // Base cost
      startedAt: new Date(),
      createdAt: new Date()
    };
    
    trainingSessions.push(trainingSession);
    
    // Simulate training process
    simulateTraining(trainingSession._id);
    
    res.status(201).json(trainingSession);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get training session by ID
router.get('/:id', (req, res) => {
  try {
    const session = trainingSessions.find(s => s._id === req.params.id);
    
    if (!session) {
      return res.status(404).json({ error: 'Training session not found' });
    }
    
    // In a real implementation, we would check if the user owns this session
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all training sessions for user
router.get('/', (req, res) => {
  try {
    // In a real implementation, we would filter by user ID from token
    // For testing, return all sessions
    res.json(trainingSessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simulate training process
const simulateTraining = async (sessionId) => {
  try {
    // Find the session and update its status
    const session = trainingSessions.find(s => s._id === sessionId);
    if (session) {
      session.status = 'running';
    }
    
    // Simulate training progress
    for (let progress = 10; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      const progressSession = trainingSessions.find(s => s._id === sessionId);
      if (progressSession) {
        progressSession.progress = progress;
      }
    }
    
    // Mark as completed
    const completedSession = trainingSessions.find(s => s._id === sessionId);
    if (completedSession) {
      completedSession.status = 'completed';
      completedSession.completedAt = new Date();
    }
    
  } catch (error) {
    console.error('Training simulation error:', error);
    const errorSession = trainingSessions.find(s => s._id === sessionId);
    if (errorSession) {
      errorSession.status = 'failed';
    }
  }
};

module.exports = router;