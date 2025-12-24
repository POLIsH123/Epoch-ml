const express = require('express');

const router = express.Router();

// Reference to users from auth route (for testing only)
let users = [];

// Get user profile
router.get('/profile', (req, res) => {
  // In a real implementation, we would get user ID from token
  // For testing, return a dummy profile
  const user = { id: 'test-user-id', username: 'testuser', email: 'test@example.com', credits: 100 };
  res.json(user);
});

// Update user profile
router.put('/profile', (req, res) => {
  // In a real implementation, we would get user ID from token
  // For testing, return a dummy response
  const { username, email } = req.body;
  const updatedUser = { id: 'test-user-id', username, email, credits: 100 };
  res.json(updatedUser);
});

// Get user training history
router.get('/training-history', (req, res) => {
  // In a real implementation, we would get user ID from token
  // For testing, return an empty array
  res.json([]);
});

// Get all users (admin only)
router.get('/', (req, res) => {
  // For testing, return an empty array
  res.json([]);
});

module.exports = router;