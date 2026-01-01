const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Model = require('../models/Model');
const TrainingSession = require('../models/TrainingSession');
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

    const { name, type, description, layers } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Model name and type are required' });
    }

    let db_type;
    if (['LSTM', 'GRU', 'RNN'].includes(type)) {
      db_type = 'RNN';
    } else if (['CNN', 'ResNet', 'VGG', 'Inception'].includes(type)) {
      db_type = 'CNN';
    } else if (['DQN', 'A2C', 'PPO', 'SAC', 'DDPG', 'TD3'].includes(type)) {
      db_type = 'RL';
    } else if (['RANDOM_FOREST', 'GRADIENT_BOOSTING', 'XGBOOST', 'LIGHTGBM', 'Random Forest', 'Gradient Boosting', 'XGBoost', 'LightGBM'].includes(type)) {
      db_type = 'ENSEMBLE';
    } else {
      db_type = 'OTHER';
    }

    // Create a new model and add to DB
    const newModel = new Model({
      name,
      type: db_type,
      architecture: type, // Store the specific type here
      description: description || `A ${type} model for ${name}`,
      createdBy: user._id,
      layers: layers || []
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

    // Find and terminate any associated active training processes
    const activeSessions = await TrainingSession.find({ modelId: req.params.id, userId: user._id, status: { $in: ['queued', 'running'] } });
    
    // Terminate any active training processes
    if (activeSessions.length > 0) {
      const { activeTrainingProcesses } = require('../utils/trainingProcesses'); // Import the active processes map
      
      activeSessions.forEach(session => {
        const processId = session._id.toString();
        const process = activeTrainingProcesses.get(processId);
        if (process) {
          process.kill(); // Terminate the process
          activeTrainingProcesses.delete(processId); // Remove from map
        }
      });
    }
    
    // Delete any associated training sessions for this model
    await TrainingSession.deleteMany({ modelId: req.params.id, userId: user._id });
    
    res.json({ message: 'Model and associated training sessions deleted successfully' });
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
        console.error('Failed to parse inference results:', output);
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