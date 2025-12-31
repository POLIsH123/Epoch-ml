const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TrainingSession = require('../models/TrainingSession');
const Model = require('../models/Model');
const { spawn } = require('child_process');
const path = require('path');

const { activeTrainingProcesses } = require('../utils/trainingProcesses');

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

    // Find the model in DB
    const model = await Model.findById(modelId);

    if (!model) {
      return res.status(400).json({ error: `Model with ID ${modelId} not found` });
    }

    if (model.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Model does not belong to user' });
    }

    // Check if user already has an active training session
    const activeSession = await TrainingSession.findOne({
      userId: user._id.toString(),
      status: { $in: ['queued', 'running'] }
    });
    
    if (activeSession) {
      return res.status(400).json({ 
        error: 'You already have an active training session. Please wait for it to complete before starting another.' 
      });
    }
    
    // Calculate cost based on model type
    let modelTrainingCost = 10; // Base cost
    switch (model.type) {
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
    }

    // Dynamic cost based on epochs
    const epochs = parameters?.epochs || 5;
    const epochMultiplier = Math.max(1, epochs / 5);
    modelTrainingCost = Math.round(modelTrainingCost * epochMultiplier);

    if (user.credits < modelTrainingCost) {
      return res.status(400).json({ error: `Insufficient credits. Requires ${modelTrainingCost}, have ${user.credits}.` });
    }

    // Create a new training session in DB
    const trainingSession = new TrainingSession({
      userId: user._id.toString(),
      modelId,
      datasetId,
      targetColumn,
      parameters,
      status: 'queued',
      cost: modelTrainingCost
    });

    await trainingSession.save();

    // Deduct credits
    user.credits -= modelTrainingCost;
    await user.save();

    // Spawn Python Training Process using VENV
    const pythonPath = path.join(process.cwd(), 'venv', 'Scripts', 'python');
    const pythonProcess = spawn(pythonPath, [
      'training/train_model.py',
      trainingSession._id.toString(),
      datasetId,
      JSON.stringify(parameters)
    ]);

    activeTrainingProcesses.set(trainingSession._id.toString(), pythonProcess);

    // DRAIN THE PIPES! (Prevents the "Epoch 308" hang)
    pythonProcess.stdout.on('data', (data) => {
      // Optional: console.log(`[Python Training]: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`[Python Error]: ${data}`);
    });
    pythonProcess.on('close', (code) => {
      activeTrainingProcesses.delete(trainingSession._id.toString());
      console.log(`Training process for ${trainingSession._id} finished with code ${code}`);

      const io = req.app.get('io');
      if (code === 0) {
        io.to(user._id.toString()).emit('training_finished', {
          sessionId: trainingSession._id,
          modelName: model.name
        });
      } else {
        io.to(user._id.toString()).emit('training_failed', {
          sessionId: trainingSession._id,
          modelName: model.name
        });
      }
    });

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

    // Get training sessions for this user from DB
    const userSessions = await TrainingSession.find({ userId: user._id.toString() });

    const sessionsWithDetails = await Promise.all(userSessions.map(async (session) => {
      const model = await Model.findById(session.modelId);

      return {
        id: session._id,
        modelId: session.modelId,
        modelName: model ? model.name : 'Unknown Model',
        modelType: model ? model.type : 'Unknown',
        datasetId: session.datasetId,
        status: session.status,
        startTime: session.startTime,
        cost: session.cost,
        targetColumn: session.targetColumn,
        params: session.parameters,
        metrics: {
          accuracy: session.accuracy,
          accuracyPercent: session.accuracyPercent,
          metricName: session.metricName,
          loss: session.loss,
          lossPercent: session.lossPercent,
          epochsCompleted: session.currentEpoch,
          totalEpochs: session.totalEpochs
        }
      };
    }));

    res.json(sessionsWithDetails);
  } catch (error) {
    console.error('Error fetching training history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a training session
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

    // Attempt to delete the training session from DB
    const deleted = await TrainingSession.findOneAndDelete({ _id: req.params.id, userId: user._id.toString() });

    if (!deleted) {
      return res.status(404).json({ error: 'Training session not found' });
    }

    res.json({ message: 'Training session deleted successfully' });
  } catch (error) {
    console.error('Error deleting training session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get training statistics for dashboard
router.get('/stats', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    const userId = decoded.userId;

    const sessions = await TrainingSession.find({ userId });

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const successRate = totalSessions > 0 ? (completedSessions / totalSessions * 100) : 0;

    const totalCreditsSpent = sessions.reduce((sum, s) => sum + (s.cost || 0), 0);

    // Calculate "trend" - compare sessions in last 24h vs previous 24h
    const now = new Date();
    const last24h = new Date(now - 24 * 60 * 60 * 1000);
    const prev24h = new Date(now - 48 * 60 * 60 * 1000);

    const sessionsLast24h = sessions.filter(s => new Date(s.startTime) > last24h).length;
    const sessionsPrev24h = sessions.filter(s => new Date(s.startTime) > prev24h && new Date(s.startTime) <= last24h).length;

    let trend = 0;
    if (sessionsPrev24h > 0) {
      trend = ((sessionsLast24h - sessionsPrev24h) / sessionsPrev24h) * 100;
    } else if (sessionsLast24h > 0) {
      trend = 100;
    }

    res.json({
      totalSessions,
      completedSessions,
      successRate: successRate.toFixed(1),
      totalCreditsSpent,
      activityTrend: trend.toFixed(1),
      activeNodes: Math.floor(Math.random() * 500) + 800, // Dynamic but simulated for network wide
      latency: Math.floor(Math.random() * 20) + 30 // Simulating realistic latency
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;