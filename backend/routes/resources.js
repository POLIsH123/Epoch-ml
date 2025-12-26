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
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    
    // Find user by ID
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // In a real implementation, we would query a Dataset model
    // For now, returning mock data with appropriate datasets for each model type
    const mockDatasets = [
      // Image datasets for CNN models
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
        name: 'CIFAR-100',
        type: 'image',
        size: '60,000 images',
        description: 'Color images in 100 classes (32x32 pixels)',
        modelCompatibility: ['CNN', 'ResNet', 'Inception', 'VGG'],
        columns: ['image', 'label']
      },
      {
        id: 'dataset-4',
        name: 'ImageNet Subset',
        type: 'image',
        size: '1,000,000 images',
        description: 'Large-scale image dataset (224x224 pixels)',
        modelCompatibility: ['ResNet', 'Inception', 'VGG'],
        columns: ['image', 'label']
      },
      
      // Text datasets for Transformer models
      {
        id: 'dataset-5',
        name: 'IMDB Reviews',
        type: 'text',
        size: '50,000 reviews',
        description: 'Movie reviews with sentiment labels',
        modelCompatibility: ['GPT-2', 'GPT-3', 'GPT-3.5', 'GPT-4', 'BERT', 'T5', 'RNN', 'LSTM', 'GRU'],
        columns: ['review', 'sentiment']
      },
      {
        id: 'dataset-6',
        name: 'Wikipedia Articles',
        type: 'text',
        size: '4,600,000 articles',
        description: 'Wikipedia articles for language modeling',
        modelCompatibility: ['GPT-2', 'GPT-3', 'GPT-3.5', 'GPT-4', 'BERT', 'T5'],
        columns: ['title', 'text', 'category']
      },
      {
        id: 'dataset-7',
        name: 'Book Corpus',
        type: 'text',
        size: '11,038 books',
        description: 'Books for language modeling',
        modelCompatibility: ['GPT-2', 'GPT-3', 'GPT-3.5', 'GPT-4', 'T5'],
        columns: ['title', 'text', 'author']
      },
      {
        id: 'dataset-8',
        name: 'Common Crawl',
        type: 'text',
        size: '138GB text',
        description: 'Web crawl data for language modeling',
        modelCompatibility: ['GPT-3', 'GPT-3.5', 'GPT-4', 'BERT', 'T5'],
        columns: ['url', 'text', 'domain']
      },
      
      // Tabular datasets for ensemble models
      {
        id: 'dataset-9',
        name: 'Boston Housing',
        type: 'csv',
        size: '506 rows',
        description: 'Housing prices with features',
        modelCompatibility: ['Random Forest', 'Gradient Boosting', 'XGBoost', 'LightGBM', 'RNN', 'LSTM', 'CNN'],
        columns: ['crim', 'zn', 'indus', 'chas', 'nox', 'rm', 'age', 'dis', 'rad', 'tax', 'ptratio', 'b', 'lstat', 'price']
      },
      {
        id: 'dataset-10',
        name: 'Iris Dataset',
        type: 'csv',
        size: '150 rows',
        description: 'Flower species classification',
        modelCompatibility: ['Random Forest', 'Gradient Boosting', 'XGBoost', 'LightGBM', 'RNN', 'LSTM', 'CNN'],
        columns: ['sepal_length', 'sepal_width', 'petal_length', 'petal_width', 'species']
      },
      {
        id: 'dataset-11',
        name: 'Titanic Dataset',
        type: 'csv',
        size: '891 rows',
        description: 'Passenger survival prediction',
        modelCompatibility: ['Random Forest', 'Gradient Boosting', 'XGBoost', 'LightGBM', 'RNN', 'LSTM', 'CNN'],
        columns: ['passenger_id', 'survived', 'pclass', 'name', 'sex', 'age', 'sibsp', 'parch', 'ticket', 'fare', 'cabin', 'embarked']
      },
      {
        id: 'dataset-12',
        name: 'Adult Income',
        type: 'csv',
        size: '48,842 rows',
        description: 'Income prediction from census data',
        modelCompatibility: ['Random Forest', 'Gradient Boosting', 'XGBoost', 'LightGBM', 'RNN', 'LSTM', 'CNN'],
        columns: ['age', 'workclass', 'fnlwgt', 'education', 'education-num', 'marital-status', 'occupation', 'relationship', 'race', 'sex', 'capital-gain', 'capital-loss', 'hours-per-week', 'native-country', 'income']
      },
      
      // Time series datasets for RNN models
      {
        id: 'dataset-13',
        name: 'Stock Prices',
        type: 'csv',
        size: '252 trading days',
        description: 'Historical stock prices',
        modelCompatibility: ['RNN', 'LSTM', 'GRU', 'CNN'],
        columns: ['date', 'open', 'high', 'low', 'close', 'volume']
      },
      {
        id: 'dataset-14',
        name: 'Weather Data',
        type: 'csv',
        size: '365 days',
        description: 'Daily weather measurements',
        modelCompatibility: ['RNN', 'LSTM', 'GRU', 'CNN'],
        columns: ['date', 'temperature', 'humidity', 'pressure', 'wind_speed', 'precipitation']
      },
      {
        id: 'dataset-15',
        name: 'Energy Consumption',
        type: 'csv',
        size: '1,440 data points',
        description: 'Hourly energy consumption',
        modelCompatibility: ['RNN', 'LSTM', 'GRU', 'CNN'],
        columns: ['timestamp', 'energy_consumption', 'temperature', 'humidity', 'day_of_week', 'hour']
      },
      
      // Custom datasets (user uploaded)
      {
        id: 'dataset-16',
        name: 'Custom CSV Dataset',
        type: 'csv',
        size: 'Variable',
        description: 'User uploaded CSV dataset',
        modelCompatibility: ['RNN', 'LSTM', 'GRU', 'CNN', 'ResNet', 'Inception', 'VGG', 'Random Forest', 'Gradient Boosting', 'XGBoost', 'LightGBM'],
        columns: ['custom_column_1', 'custom_column_2', 'target']
      }
    ];
    
    res.json(mockDatasets);
  } catch (error) {
    console.error('Error fetching datasets:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;