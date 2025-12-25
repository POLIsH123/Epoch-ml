const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Model = require('../models/Model');

// Get all models for the authenticated user
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // In a real app, you would verify the JWT token here
    // For this mock implementation, we'll use a simple approach
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // In a real implementation, we would query the Model model
    // For now, returning mock data
    const mockModels = [
      {
        _id: '1',
        name: 'Sentiment Analysis RNN',
        type: 'RNN',
        architecture: 'LSTM',
        description: 'An RNN model for sentiment analysis',
        userId: user._id,
        createdAt: new Date()
      },
      {
        _id: '2',
        name: 'Image Classifier CNN',
        type: 'CNN',
        architecture: 'ResNet',
        description: 'A CNN model for image classification',
        userId: user._id,
        createdAt: new Date()
      },
      {
        _id: '3',
        name: 'Text Generator GPT',
        type: 'GPT',
        architecture: 'Transformer',
        description: 'A GPT model for text generation',
        userId: user._id,
        createdAt: new Date()
      },
      {
        _id: '4',
        name: 'CartPole RL Agent',
        type: 'Reinforcement Learning',
        architecture: 'DQN',
        description: 'A reinforcement learning agent for CartPole environment',
        userId: user._id,
        createdAt: new Date()
      }
    ];
    
    res.json(mockModels);
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new model
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const { name, type, description } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Model name and type are required' });
    }
    
    // In a real implementation, we would create a new Model document
    // For now, returning mock data
    const newModel = {
      _id: Date.now().toString(),
      name,
      type,
      architecture: type === 'RNN' ? 'LSTM' : 
                  type === 'CNN' ? 'ResNet' : 
                  type === 'GPT' ? 'Transformer' : 
                  type === 'Reinforcement Learning' ? 'DQN' : 'Dense',
      description: description || `A ${type} model for ${name}`,
      userId: user._id,
      createdAt: new Date()
    };
    
    res.status(201).json(newModel);
  } catch (error) {
    console.error('Error creating model:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific model by ID
router.get('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // In a real implementation, we would query the Model model by ID
    // For now, returning mock data
    const mockModel = {
      _id: req.params.id,
      name: 'Sample Model',
      type: 'RNN',
      architecture: 'LSTM',
      description: 'A sample model',
      userId: user._id,
      createdAt: new Date()
    };
    
    res.json(mockModel);
  } catch (error) {
    console.error('Error fetching model:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;