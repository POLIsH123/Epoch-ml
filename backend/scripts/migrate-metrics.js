const mongoose = require('mongoose');
const TrainingSession = require('./backend/models/TrainingSession');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/epoch-ml';

async function migrate() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB for migration...');

        // Update sessions using dataset-9 (Boston Housing) or dataset-13 (Stocks) to MAE
        const result = await TrainingSession.updateMany(
            {
                datasetId: { $in: ['dataset-9', 'dataset-13'] },
                $or: [
                    { metricName: { $exists: false } },
                    { metricName: 'Accuracy' }
                ]
            },
            { $set: { metricName: 'MAE' } }
        );

        console.log(`Migration complete! Updated ${result.modifiedCount} sessions.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
