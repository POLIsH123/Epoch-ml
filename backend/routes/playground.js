const express = require('express');
const router = express.Router();

// AI Playground routes
router.get('/', (req, res) => {
  res.json({ message: 'AI Playground API is running' });
});

module.exports = router;