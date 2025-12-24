const express = require('express');
const { validateTraining, handleValidationErrors } = require('../middleware/validation');
const { spawn } = require('child_process');
const path = require('path');

const router = express.Router();

// In-memory training sessions storage (for testing only)
let trainingSessions = [];

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
    
    // Execute Python training script based on model type
    executePythonTraining(trainingSession._id, modelId, parameters);
    
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

// Execute Python training script
const executePythonTraining = async (sessionId, modelId, parameters) => {
  try {
    // Find the training session
    const session = trainingSessions.find(s => s._id === sessionId);
    if (!session) {
      console.error('Session not found for ID:', sessionId);
      return;
    }

    // Determine the Python script to run based on model type
    let pythonScript;
    if (modelId.includes('RNN') || modelId.includes('1')) {
      pythonScript = path.join(__dirname, '../../models/rnn/rnn_model.py');
    } else if (modelId.includes('CNN') || modelId.includes('2')) {
      pythonScript = path.join(__dirname, '../../models/cnn/cnn_model.py');
    } else if (modelId.includes('GPT') || modelId.includes('3')) {
      pythonScript = path.join(__dirname, '../../models/gpt/gpt_model.py');
    } else if (modelId.includes('Transformer') || modelId.includes('4')) {
      pythonScript = path.join(__dirname, '../../models/gpt/gpt_model.py'); // Using GPT as transformer base
    } else if (modelId.includes('Reinforcement') || modelId.includes('RL') || modelId.includes('5') || 
               modelId.includes('6') || modelId.includes('7') || modelId.includes('8') || modelId.includes('9')) {
      pythonScript = path.join(__dirname, '../../models/rnn/rl_model.py'); // Use the new RL model for all RL algorithms
    } else if (modelId.includes('Ensemble') || modelId.includes('10')) {
      // For ensemble models, we would need a specific ensemble script
      pythonScript = path.join(__dirname, '../../models/base_model.py'); // Placeholder - would need specific ensemble model
    } else {
      // Default to base model if type is not recognized
      pythonScript = path.join(__dirname, '../../models/base_model.py');
    }

    // Update session status to running
    session.status = 'running';

    // Spawn Python process
    const pythonProcess = spawn('python', [pythonScript, JSON.stringify(parameters)]);

    pythonProcess.stdout.on('data', (data) => {
      console.log(`Python output: ${data}`);
      // Parse progress updates from Python script
      const output = data.toString();
      if (output.includes('PROGRESS:')) {
        const progressMatch = output.match(/PROGRESS:(\d+)/);
        if (progressMatch) {
          const progress = parseInt(progressMatch[1]);
          session.progress = progress;
        }
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
      if (code === 0) {
        session.status = 'completed';
      } else {
        session.status = 'failed';
      }
      session.completedAt = new Date();
    });

  } catch (error) {
    console.error('Error executing Python training:', error);
    const session = trainingSessions.find(s => s._id === sessionId);
    if (session) {
      session.status = 'failed';
    }
  }
};

module.exports = router;