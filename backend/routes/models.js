const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Model = require('../models/Model');
const { spawn } = require('child_process');
const path = require('path');

const router = express.Router();

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

    // Get models for the current user
    const userModels = await Model.find({ createdBy: user._id });

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

    const { name, type, description, architecture, layers } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Model name and type are required' });
    }

    // Determine architecture based on model type
    let modelArchitecture = type; // Default to the type itself
    if (type === 'LSTM' || type === 'GRU' || type === 'RNN') {
      modelArchitecture = 'RNN';
    } else if (type === 'ResNet' || type === 'Inception' || type === 'VGG' || type === 'CNN') {
      modelArchitecture = 'CNN';
    } else if (type === 'GPT-2' || type === 'GPT-3' || type === 'GPT-3.5' || type === 'GPT-4' || type === 'BERT' || type === 'T5') {
      modelArchitecture = 'Transformer';
    } else if (type === 'DQN' || type === 'A2C' || type === 'PPO' || type === 'SAC' || type === 'DDPG' || type === 'TD3') {
      modelArchitecture = 'Reinforcement Learning';
    } else if (type === 'Random Forest' || type === 'Gradient Boosting' || type === 'XGBoost' || type === 'LightGBM') {
      modelArchitecture = 'Ensemble';
    } else if (type === 'Custom' || type === 'Multi-Layer') {
      modelArchitecture = architecture || 'Multi-Layer';
    }

    // Create a new model and add to DB
    const newModel = new Model({
      name,
      type: ['RNN', 'CNN', 'GPT', 'RL'].includes(modelArchitecture) ? modelArchitecture : type,
      architecture: modelArchitecture,
      description: description || `A ${type} model for ${name}`,
      createdBy: user._id,
      layers: layers || [] // Store the layers configuration
    });

    await newModel.save();

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

    // Find the model in DB
    const model = await Model.findOne({ _id: req.params.id, createdBy: user._id });

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

    // Attempt to delete the model from DB
    const deleted = await Model.findOneAndDelete({ _id: req.params.id, createdBy: user._id });

    if (!deleted) {
      return res.status(404).json({ error: 'Model not found' });
    }

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

    // Find the model in DB
    const model = await Model.findOne({ _id: req.params.id, createdBy: user._id });

    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // Calculate cost based on model type for downloading
    let downloadCost = 5;
    // ... logic remains same but using model.architecture or model.type

    if (user.credits < downloadCost) {
      return res.status(400).json({ error: `Insufficient credits. Downloading this model requires ${downloadCost} credits, but you only have ${user.credits}.` });
    }

    // Deduct credits from user account
    user.credits -= downloadCost;
    await user.save();

    // Create a mock model file to download (placeholder for actual .h5 file in future)
    const modelData = {
      modelId: model._id,
      modelName: model.name,
      architecture: model.architecture,
      createdAt: model.createdAt
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${model.name.replace(/\s+/g, '_')}_model.json"`);
    res.send(JSON.stringify(modelData, null, 2));
  } catch (error) {
    console.error('Error downloading model:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test/Inference Endpoint
router.post('/:id/test', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: 'Invalid token' });

    const model = await Model.findOne({ _id: req.params.id, createdBy: user._id });
    if (!model) return res.status(404).json({ error: 'Model not found' });

    const { testData, datasetId } = req.body;

    // Perform inference using Python script in VENV
    const pythonPath = path.join(process.cwd(), 'venv', 'Scripts', 'python');
    const pythonProcess = spawn(pythonPath, ['models/inference.py', model._id, JSON.stringify(testData || "{}"), datasetId || 'unknown']);

    let output = '';
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.on('close', (code) => {
      try {
        // Find the last JSON block in the output (to avoid TF noise)
        const lastBraceIndex = output.lastIndexOf('}');
        const firstBraceIndex = output.lastIndexOf('{', lastBraceIndex);
        const jsonStr = output.substring(firstBraceIndex, lastBraceIndex + 1);

        const results = JSON.parse(jsonStr || '{}');
        if (code !== 0 || results.error) {
          return res.status(500).json({ error: results.error || 'Inference failed' });
        }
        res.json(results);
      } catch (e) {
        if (code !== 0) {
          return res.status(500).json({ error: `Inference failed with code ${code}. ${output}` });
        }
        res.status(500).json({ error: 'Failed to parse inference results' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;