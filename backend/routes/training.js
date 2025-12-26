const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TrainingSession = require('../models/TrainingSession');
const { findModel } = require('../models/ModelStorage');

const router = express.Router();

// Start a new training session
router.post('/start', async (req, res) => {
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
    
    const { modelId, datasetId, targetColumn, parameters } = req.body;
    
    if (!modelId || !datasetId) {
      return res.status(400).json({ error: 'Model ID and Dataset ID are required' });
    }
    
    // Get the model to determine its type for cost calculation
    // Find the model in storage
    const model = findModel(modelId);
    
    if (!model || model.userId !== user._id) {
      return res.status(400).json({ error: 'Model not found' });
    }
    
    // Calculate cost based on model type
    let modelTrainingCost = 10; // Base cost
    switch(model.type) {
      case 'GPT-4':
        modelTrainingCost = 100;
        break;
      case 'GPT-3.5':
      case 'BERT':
      case 'T5':
        modelTrainingCost = 50;
        break;
      case 'GPT-3':
      case 'ResNet':
      case 'Inception':
      case 'PPO':
      case 'SAC':
        modelTrainingCost = 30;
        break;
      case 'GPT-2':
      case 'VGG':
      case 'DQN':
      case 'A2C':
      case 'DDPG':
      case 'TD3':
        modelTrainingCost = 20;
        break;
      case 'LSTM':
      case 'GRU':
      case 'CNN':
      case 'RNN':
      case 'Random Forest':
      case 'Gradient Boosting':
      case 'XGBoost':
      case 'LightGBM':
        modelTrainingCost = 10;
        break;
      default:
        modelTrainingCost = 10;
    }
    
    if (user.credits < modelTrainingCost) {
      return res.status(400).json({ error: `Insufficient credits. Training this model requires ${modelTrainingCost} credits, but you only have ${user.credits}.` });
    }
    
    // Create a new training session
    const trainingSession = new TrainingSession({
      userId: user._id.toString(), // Convert to string to match schema
      modelId,
      datasetId,
      targetColumn,
      parameters,
      status: 'queued',
      startTime: new Date(),
      cost: modelTrainingCost // Add the cost field
    });
    
    await trainingSession.save();
    
    // Deduct credits from user account
    user.credits -= modelTrainingCost;
    await user.save();
    
    res.status(201).json({
      message: 'Training started successfully',
      sessionId: trainingSession._id,
      creditsRemaining: user.credits,
      cost: modelTrainingCost
    });
  } catch (error) {
    console.error('Error starting training:', error);
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
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    
    // Find user by ID
    const user = await User.findById(decoded.userId);
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
        modelType: 'LSTM',
        datasetId: 'dataset-1',
        datasetName: 'IMDB Reviews',
        status: 'completed',
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(Date.now() - 1800000),
        accuracy: 0.87,
        loss: 0.32,
        targetColumn: 'sentiment',
        cost: 10
      },
      {
        id: '2',
        modelId: 'model-2',
        modelName: 'Image Classifier CNN',
        modelType: 'ResNet',
        datasetId: 'dataset-2',
        datasetName: 'MNIST Digits',
        status: 'completed',
        startTime: new Date(Date.now() - 86400000),
        endTime: new Date(Date.now() - 72000000),
        accuracy: 0.94,
        loss: 0.18,
        targetColumn: 'label',
        cost: 30
      },
      {
        id: '3',
        modelId: 'model-3',
        modelName: 'Text Generator GPT',
        modelType: 'GPT-3',
        datasetId: 'dataset-3',
        datasetName: 'Custom Text',
        status: 'running',
        startTime: new Date(),
        endTime: null,
        accuracy: 0.0,
        loss: 1.2,
        targetColumn: null,
        cost: 50
      }
    ];
    
    res.json(mockSessions);
  } catch (error) {
    console.error('Error fetching training history:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;