const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Store custom datasets in memory (in production, use a database)
let customDatasets = [];

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
        modelCompatibility: ['CNN', 'ResNet', 'Inception', 'VGG', 'Custom', 'Multi-Layer'],
        columns: ['image', 'label'],
        targetColumn: 'label'
      },
      {
        id: 'dataset-2',
        name: 'CIFAR-10',
        type: 'image',
        size: '60,000 images',
        description: 'Color images in 10 classes (32x32 pixels)',
        modelCompatibility: ['CNN', 'ResNet', 'Inception', 'VGG', 'Custom', 'Multi-Layer'],
        columns: ['image', 'label'],
        targetColumn: 'label'
      },
      {
        id: 'dataset-3',
        name: 'Stock Prices',
        type: 'csv',
        size: '252 trading days',
        description: 'Historical stock prices',
        modelCompatibility: ['RNN', 'LSTM', 'GRU', 'Custom', 'Multi-Layer'],
        columns: ['date', 'open', 'high', 'low', 'close', 'volume'],
        targetColumn: 'close'
      },
      {
        id: 'dataset-4',
        name: 'News Headlines Sentiment',
        type: 'text',
        size: '100,000 headlines',
        description: 'News headlines with emotional labels (e.g., joy, anger, sadness)',
        modelCompatibility: ['RNN', 'LSTM', 'GRU', 'Custom', 'Multi-Layer'],
        columns: ['headline', 'emotion_label'],
        targetColumn: 'emotion_label'
      },
      {
        id: 'dataset-9',
        name: 'Boston Housing',
        type: 'tabular',
        size: '506 samples',
        description: 'Real estate prices in Boston (regression task)',
        modelCompatibility: ['Random Forest', 'Gradient Boosting', 'XGBoost', 'LightGBM', 'Custom', 'Multi-Layer'],
        columns: ['CRIM', 'ZN', 'INDUS', 'CHAS', 'NOX', 'RM', 'AGE', 'DIS', 'RAD', 'TAX', 'PTRATIO', 'B', 'LSTAT', 'MEDV'],
        targetColumn: 'MEDV'
      },
      {
        id: 'dataset-13',
        name: 'Iris Classification',
        type: 'tabular',
        size: '150 samples',
        description: 'Iris flower species classification (3 classes)',
        modelCompatibility: ['Random Forest', 'Gradient Boosting', 'XGBoost', 'LightGBM', 'Custom', 'Multi-Layer'],
        columns: ['sepal_length', 'sepal_width', 'petal_length', 'petal_width', 'species'],
        targetColumn: 'species'
      },
      {
        id: 'iris',
        name: 'Iris Dataset (sklearn)',
        type: 'tabular',
        size: '150 samples',
        description: 'Iris flower species classification - 4 features, 3 classes',
        modelCompatibility: ['Random Forest', 'Gradient Boosting', 'XGBoost', 'LightGBM', 'RANDOM_FOREST', 'GRADIENT_BOOSTING', 'XGBOOST', 'Custom', 'Multi-Layer'],
        columns: ['sepal_length', 'sepal_width', 'petal_length', 'petal_width', 'species'],
        targetColumn: 'species'
      },
      {
        id: 'wine',
        name: 'Wine Dataset (sklearn)',
        type: 'tabular',
        size: '178 samples',
        description: 'Wine cultivar classification - 13 features, 3 classes',
        modelCompatibility: ['Random Forest', 'Gradient Boosting', 'XGBoost', 'LightGBM', 'RANDOM_FOREST', 'GRADIENT_BOOSTING', 'XGBOOST', 'Custom', 'Multi-Layer'],
        columns: ['alcohol', 'malic_acid', 'ash', 'alcalinity', 'magnesium', 'phenols', 'flavanoids', 'nonflavanoid_phenols', 'proanthocyanins', 'color_intensity', 'hue', 'od280_od315', 'proline', 'class'],
        targetColumn: 'class'
      },
      {
        id: 'breast_cancer',
        name: 'Breast Cancer Dataset (sklearn)',
        type: 'tabular',
        size: '569 samples',
        description: 'Breast cancer diagnosis - 30 features, binary classification',
        modelCompatibility: ['Random Forest', 'Gradient Boosting', 'XGBoost', 'LightGBM', 'RANDOM_FOREST', 'GRADIENT_BOOSTING', 'XGBOOST', 'Custom', 'Multi-Layer'],
        columns: ['mean_radius', 'mean_texture', 'mean_perimeter', 'mean_area', 'mean_smoothness', '...', 'diagnosis'],
        targetColumn: 'diagnosis'
      },
      {
        id: 'digits',
        name: 'Digits Dataset (sklearn)',
        type: 'tabular',
        size: '1,797 samples',
        description: 'Handwritten digit classification - 64 features (8x8 images), 10 classes',
        modelCompatibility: ['Random Forest', 'Gradient Boosting', 'XGBoost', 'LightGBM', 'RANDOM_FOREST', 'GRADIENT_BOOSTING', 'XGBOOST', 'Custom', 'Multi-Layer'],
        columns: ['pixel_0_0', 'pixel_0_1', '...', 'pixel_7_7', 'digit'],
        targetColumn: 'digit'
      }
    ];

    // Combine built-in datasets with custom datasets
    const allDatasets = [...mockDatasets, ...customDatasets];
    res.json(allDatasets);
  } catch (error) {
    console.error('Error fetching datasets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new custom dataset
router.post('/datasets', async (req, res) => {
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

    const { name, description, type, size, columns, targetColumn, modelCompatibility, config } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Dataset name is required' });
    }

    // Create new dataset object
    const newDataset = {
      id: `custom-${Date.now()}`,
      name,
      description: description || '',
      type: type || 'csv',
      size: size || '0 samples',
      columns: columns || [],
      targetColumn: targetColumn || 'label',
      modelCompatibility: modelCompatibility || ['Custom', 'Multi-Layer'],
      config: config || {},
      createdBy: user._id,
      createdAt: new Date(),
      status: 'ready'
    };

    // Add to custom datasets array
    customDatasets.push(newDataset);

    res.status(201).json(newDataset);
  } catch (error) {
    console.error('Error creating dataset:', error);
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