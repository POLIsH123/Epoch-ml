const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Get available datasets
router.get('/datasets', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const mockDatasets = [
      {
        id: 'dataset-1',
        name: 'MNIST Digits',
        type: 'image',
        size: '70,000 images',
        description: 'Handwritten digit images (28x28 pixels)',
        modelCompatibility: ['CNN', 'ResNet', 'Inception', 'VGG'],
        columns: ['image', 'label']
      },
      {
        id: 'dataset-2',
        name: 'CIFAR-10',
        type: 'image',
        size: '60,000 images',
        description: 'Color images in 10 classes (32x32 pixels)',
        modelCompatibility: ['CNN', 'ResNet', 'Inception', 'VGG'],
        columns: ['image', 'label']
      },
      {
        id: 'dataset-3',
        name: 'Stock Prices',
        type: 'csv',
        size: '252 trading days',
        description: 'Historical stock prices',
        modelCompatibility: ['RNN', 'LSTM', 'GRU'],
        columns: ['date', 'open', 'high', 'low', 'close', 'volume']
      },
      {
        id: 'dataset-4',
        name: 'News Headlines Sentiment',
        type: 'text',
        size: '100,000 headlines',
        description: 'News headlines with emotional labels (e.g., joy, anger, sadness)',
        modelCompatibility: ['RNN', 'LSTM', 'GRU', 'BERT'],
        columns: ['headline', 'emotion_label']
      }
    ];

    res.json(mockDatasets);
  } catch (error) {
    console.error('Error fetching datasets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Purchase credits
router.post('/purchase-credits', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { credits } = req.body;

    if (!credits || credits <= 0) {
      return res.status(400).json({ error: 'Invalid credit amount' });
    }

    user.credits = (user.credits || 0) + credits;
    await user.save();

    res.json({
      message: `Successfully added ${credits} credits`,
      credits: user.credits,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        credits: user.credits
      }
    });
  } catch (error) {
    console.error('Error purchasing credits:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save HuggingFace API Key
router.post('/huggingface-key', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    user.huggingFaceApiKey = apiKey;
    await user.save();

    res.json({
      message: 'HuggingFace API key saved successfully',
      hasApiKey: true
    });
  } catch (error) {
    console.error('Error saving API key:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;