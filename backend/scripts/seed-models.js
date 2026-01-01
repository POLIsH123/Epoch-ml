const mongoose = require('mongoose');
const Model = require('../models/Model');
require('dotenv').config();

const SEED_MODELS = [
    // CNN Variants
    { name: 'ResNet-50', type: 'CNN', architecture: 'CNN', description: 'Deep residual network with 50 layers for image classification' },
    { name: 'ResNet-101', type: 'CNN', architecture: 'CNN', description: 'Deeper residual network with 101 layers for complex image tasks' },
    { name: 'VGG-16', type: 'CNN', architecture: 'CNN', description: 'Classic 16-layer convolutional network for image recognition' },
    { name: 'VGG-19', type: 'CNN', architecture: 'CNN', description: '19-layer variant of VGG for enhanced feature extraction' },
    { name: 'Inception-v3', type: 'CNN', architecture: 'CNN', description: 'Multi-scale convolutional network with inception modules' },
    { name: 'MobileNet', type: 'CNN', architecture: 'CNN', description: 'Lightweight CNN optimized for mobile and edge devices' },
    { name: 'EfficientNet-B0', type: 'CNN', architecture: 'CNN', description: 'Efficient scaled CNN balancing depth, width, and resolution' },

    // RNN Variants
    { name: 'LSTM-128', type: 'RNN', architecture: 'RNN', description: 'Long Short-Term Memory network with 128 hidden units' },
    { name: 'LSTM-256', type: 'RNN', architecture: 'RNN', description: 'LSTM with 256 hidden units for complex sequence modeling' },
    { name: 'GRU-128', type: 'RNN', architecture: 'RNN', description: 'Gated Recurrent Unit with 128 hidden units' },
    { name: 'Bi-LSTM', type: 'RNN', architecture: 'RNN', description: 'Bidirectional LSTM for context-aware sequence processing' },

    // Ensemble Methods
    { name: 'Random Forest', type: 'OTHER', architecture: 'Ensemble', description: 'Ensemble of decision trees for classification and regression' },
    { name: 'XGBoost', type: 'OTHER', architecture: 'Ensemble', description: 'Gradient boosting framework optimized for speed and performance' },
    { name: 'LightGBM', type: 'OTHER', architecture: 'Ensemble', description: 'Fast gradient boosting with histogram-based learning' },
    { name: 'CatBoost', type: 'OTHER', architecture: 'Ensemble', description: 'Gradient boosting with categorical feature support' },


    // RL Agents
    { name: 'DQN', type: 'RL', architecture: 'Reinforcement Learning', description: 'Deep Q-Network for discrete action spaces' },
    { name: 'PPO', type: 'RL', architecture: 'Reinforcement Learning', description: 'Proximal Policy Optimization for stable training' },
    { name: 'A3C', type: 'RL', architecture: 'Reinforcement Learning', description: 'Asynchronous Advantage Actor-Critic' }
];

async function seedModels() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/epoch-ml', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');

        // Check if models already exist
        const existingCount = await Model.countDocuments();
        if (existingCount > 0) {
            console.log(`Database already has ${existingCount} models. Skipping seed.`);
            await mongoose.connection.close();
            return;
        }

        // Insert seed models
        const result = await Model.insertMany(SEED_MODELS);
        console.log(`✅ Successfully seeded ${result.length} models`);

        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error seeding models:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    seedModels();
}

module.exports = seedModels;
