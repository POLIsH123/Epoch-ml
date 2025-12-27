const mongoose = require('mongoose');
const TrainingSession = require('../models/TrainingSession');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/epoch-ml';

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        const sessions = await TrainingSession.find({ datasetId: 'dataset-9' });
        console.log(JSON.stringify(sessions, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
