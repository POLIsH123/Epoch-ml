const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get user profile data
router.get('/profile', async (req, res) => {
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
    
    res.json({
      username: user.username,
      email: user.email,
      credits: user.credits,
      role: user.role || 'user',
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user datasets
router.get('/datasets', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // In a real app, this would fetch from a dataset collection
    // For now, returning mock data
    // In a real implementation, we would query a Dataset model
    const datasets = [
      {
        id: '1',
        name: 'MNIST Handwritten Digits',
        description: 'Dataset of handwritten digits for image classification',
        type: 'image',
        size: '10MB',
        createdAt: new Date(),
        status: 'ready'
      },
      {
        id: '2',
        name: 'IMDB Movie Reviews',
        description: 'Dataset of movie reviews for sentiment analysis',
        type: 'text',
        size: '85MB',
        createdAt: new Date(),
        status: 'ready'
      }
    ];
    
    res.json(datasets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new dataset
router.post('/datasets', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const { name, description, type } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Dataset name is required' });
    }
    
    // In a real app, this would save to a dataset collection
    // For now, returning mock data
    const newDataset = {
      id: Date.now().toString(),
      name,
      description,
      type,
      size: '0MB',
      createdAt: new Date(),
      status: 'processing'
    };
    
    res.status(201).json(newDataset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;