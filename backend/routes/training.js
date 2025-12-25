const express = require('express');
const router = express.Router();
const User = require('../models/User');
const TrainingSession = require('../models/TrainingSession');

// Start a new training session
router.post('/start', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const { modelId, datasetId, targetColumn, parameters } = req.body;
    
    if (!modelId || !datasetId) {
      return res.status(400).json({ error: 'Model ID and Dataset ID are required' });
    }
    
    // Check if user has enough credits (simplified for this example)
    // In a real app, you would calculate cost based on model type and parameters
    const modelTrainingCost = 10; // Fixed cost for this example
    if (user.credits < modelTrainingCost) {
      return res.status(400).json({ error: 'Insufficient credits' });
    }
    
    // Create a new training session
    const trainingSession = new TrainingSession({
      userId: user._id,
      modelId,
      datasetId,
      targetColumn,
      parameters,
      status: 'queued',
      startTime: new Date()
    });
    
    await trainingSession.save();
    
    // Deduct credits from user account
    user.credits -= modelTrainingCost;
    await user.save();
    
    res.status(201).json({
      message: 'Training started successfully',
      sessionId: trainingSession._id,
      creditsRemaining: user.credits
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's training history
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // In a real app, this would fetch from the TrainingSession model
    // For now, returning mock data
    const mockSessions = [
      {
        id: '1',
        modelId: 'model-1',
        modelName: 'Sentiment Analysis RNN',
        modelType: 'RNN',
        datasetId: 'dataset-1',
        datasetName: 'IMDB Reviews',
        status: 'completed',
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(Date.now() - 1800000),
        accuracy: 0.87,
        loss: 0.32,
        targetColumn: 'sentiment'
      },
      {
        id: '2',
        modelId: 'model-2',
        modelName: 'Image Classifier CNN',
        modelType: 'CNN',
        datasetId: 'dataset-2',
        datasetName: 'MNIST Digits',
        status: 'completed',
        startTime: new Date(Date.now() - 86400000),
        endTime: new Date(Date.now() - 72000000),
        accuracy: 0.94,
        loss: 0.18,
        targetColumn: 'label'
      },
      {
        id: '3',
        modelId: 'model-3',
        modelName: 'Text Generator GPT',
        modelType: 'GPT',
        datasetId: 'dataset-3',
        datasetName: 'Custom Text',
        status: 'running',
        startTime: new Date(),
        endTime: null,
        accuracy: 0.0,
        loss: 1.2,
        targetColumn: null
      }
    ];
    
    res.json(mockSessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;