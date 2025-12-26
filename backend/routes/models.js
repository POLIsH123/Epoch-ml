const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Model = require('../models/Model');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// In-memory storage for models (in a real app, this would be a database)
let modelsStorage = [];

// Get all models for the authenticated user
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
    
    // Filter models for the current user
    const userModels = modelsStorage.filter(model => model.userId === user._id);
    
    res.json(userModels);
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
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    
    // Find user by ID
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const { name, type, description } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Model name and type are required' });
    }
    
    // Determine architecture based on model type
    let architecture = type; // Default to the type itself
    if (type === 'LSTM' || type === 'GRU' || type === 'RNN') {
      architecture = 'RNN';
    } else if (type === 'ResNet' || type === 'Inception' || type === 'VGG' || type === 'CNN') {
      architecture = 'CNN';
    } else if (type === 'GPT-2' || type === 'GPT-3' || type === 'GPT-3.5' || type === 'GPT-4' || type === 'BERT' || type === 'T5') {
      architecture = 'Transformer';
    } else if (type === 'DQN' || type === 'A2C' || type === 'PPO' || type === 'SAC' || type === 'DDPG' || type === 'TD3') {
      architecture = 'Reinforcement Learning';
    } else if (type === 'Random Forest' || type === 'Gradient Boosting' || type === 'XGBoost' || type === 'LightGBM') {
      architecture = 'Ensemble';
    }
    
    // Create a new model and add to storage
    const newModel = {
      _id: Date.now().toString(), // Using timestamp as string ID
      name,
      type,
      architecture,
      description: description || `A ${type} model for ${name}`,
      userId: user._id,
      createdAt: new Date()
    };
    
    modelsStorage.push(newModel);
    
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
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    
    // Find user by ID
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Find the model in storage
    const model = modelsStorage.find(m => m._id === req.params.id && m.userId === user._id);
    
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    res.json(model);
  } catch (error) {
    console.error('Error fetching model:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a model
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
    
    // Find the model in storage
    const modelIndex = modelsStorage.findIndex(m => m._id === req.params.id && m.userId === user._id);
    
    if (modelIndex === -1) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    // Remove the model from storage
    modelsStorage.splice(modelIndex, 1);
    
    res.json({ message: 'Model deleted successfully' });
  } catch (error) {
    console.error('Error deleting model:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download a model
router.get('/:id/download', async (req, res) => {
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
    
    // Find the model in storage
    const model = modelsStorage.find(m => m._id === req.params.id && m.userId === user._id);
    
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    // Calculate cost based on model type for downloading
    let downloadCost = 5; // Base cost for downloading
    switch(model.type) {
      case 'GPT-4':
        downloadCost = 50;
        break;
      case 'GPT-3.5':
      case 'BERT':
      case 'T5':
        downloadCost = 25;
        break;
      case 'GPT-3':
      case 'ResNet':
      case 'Inception':
      case 'PPO':
      case 'SAC':
        downloadCost = 15;
        break;
      case 'GPT-2':
      case 'VGG':
      case 'DQN':
      case 'A2C':
      case 'DDPG':
      case 'TD3':
        downloadCost = 10;
        break;
      case 'LSTM':
      case 'GRU':
      case 'CNN':
      case 'RNN':
      case 'Random Forest':
      case 'Gradient Boosting':
      case 'XGBoost':
      case 'LightGBM':
        downloadCost = 5;
        break;
      default:
        downloadCost = 5;
    }
    
    if (user.credits < downloadCost) {
      return res.status(400).json({ error: `Insufficient credits. Downloading this model requires ${downloadCost} credits, but you only have ${user.credits}.` });
    }
    
    // Deduct credits from user account
    user.credits -= downloadCost;
    await user.save();
    
    // Create a mock model file to download
    const modelData = {
      modelId: model._id,
      modelName: model.name,
      modelType: model.type,
      architecture: model.architecture,
      description: model.description,
      createdAt: model.createdAt,
      downloadDate: new Date()
    };
    
    // Convert model data to JSON string
    const modelJson = JSON.stringify(modelData, null, 2);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${model.name.replace(/\s+/g, '_')}_model.json"`);
    
    // Send the model data as a JSON file
    res.send(modelJson);
  } catch (error) {
    console.error('Error downloading model:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;