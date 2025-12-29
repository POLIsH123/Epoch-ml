const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['RNN', 'CNN', 'GPT', 'RL', 'OTHER']
  },
  description: {
    type: String,
    required: true
  },
  architecture: {
    type: String,
    required: true
  },
  parameters: {
    inputSize: Number,
    hiddenSize: Number,
    outputSize: Number,
    layers: Number,
    learningRate: Number,
    epochs: { type: Number, min: 1, max: 1000 },
    batchSize: Number,
    // Additional parameters specific to each model type
    additionalParams: mongoose.Schema.Types.Mixed
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

modelSchema.pre('save', function() {
  this.updatedAt = Date.now;
});

module.exports = mongoose.model('Model', modelSchema);
