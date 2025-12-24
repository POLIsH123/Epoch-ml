require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const securityMiddleware = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(securityMiddleware);

// CORS configuration - allow requests from frontend
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:3000',
  credentials: true
}));

// Other middleware
app.use(express.json());

// Database connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));
} else {
  console.log('MongoDB URI not provided, using in-memory storage for testing');
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/models', require('./routes/models'));
app.use('/api/training', require('./routes/training'));
app.use('/api/users', require('./routes/users'));
app.use('/api/resources', require('./routes/resources'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Epoch-ml API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});