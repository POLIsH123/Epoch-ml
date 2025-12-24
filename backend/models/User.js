const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  credits: {
    type: Number,
    default: 100  // Starting credits for new users
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  trainingHistory: [{
    modelId: String,
    modelName: String,
    trainingDate: { type: Date, default: Date.now },
    status: String,
    cost: Number
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
