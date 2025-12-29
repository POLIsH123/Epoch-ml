const mongoose = require('mongoose');
const User = require('../models/User');
const Model = require('../models/Model');
const TrainingSession = require('../models/TrainingSession');
const { connectDB } = require('../config/db');
require('dotenv').config();

const resetDB = async () => {
  try {
    await connectDB();
    console.log('Connected to DB for reset...');

    // Delete existing models and training sessions
    await Model.deleteMany({});
    console.log('Cleared models collection');

    await TrainingSession.deleteMany({});
    console.log('Cleared training sessions collection');

    // Reset all users' credits to 100
    const result = await User.updateMany({}, { $set: { credits: 100 } });
    console.log(`Reset credits for ${result.modifiedCount} users`);

    console.log('Database reset complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
};

resetDB();
