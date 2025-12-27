const mongoose = require('mongoose');

const trainingSessionSchema = new mongoose.Schema({
  userId: {
    type: String, // Using String since we're not using actual ObjectId references in this mock
    required: true
  },
  modelId: {
    type: String, // Using String for consistency with mock data
    required: true
  },
  datasetId: {
    type: String, // Using String for consistency with mock data
    required: true
  },
  targetColumn: {
    type: String
  },
  parameters: {
    learningRate: {
      type: Number,
      default: 0.001
    },
    epochs: {
      type: Number,
      default: 10
    },
    batchSize: {
      type: Number,
      default: 32
    },
    timesteps: {
      type: Number,
      default: 10000
    },
    environment: {
      type: String,
      default: 'CartPole-v1'
    }
  },
  status: {
    type: String,
    enum: ['queued', 'running', 'completed', 'failed'],
    default: 'queued'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  accuracy: {
    type: Number
  },
  metricName: {
    type: String,
    default: 'Accuracy'
  },
  loss: {
    type: Number
  },
  cost: {
    type: Number,
    default: 10  // Default cost for training session
  },
  progress: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('TrainingSession', trainingSessionSchema);