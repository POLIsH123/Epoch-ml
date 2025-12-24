const express = require('express');

const router = express.Router();

// In-memory user data (for testing only)
let users = [{ id: 'test-user-id', credits: 100 }];

// Get user's current credits
router.get('/credits', (req, res) => {
  // In a real implementation, we would get user ID from token
  // For testing, return dummy credits
  res.json({ credits: 100 });
});

// Add credits to user account (simulated payment)
router.post('/add-credits', (req, res) => {
  const { amount } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  
  // In a real system, this would process a payment
  // For simulation, we'll just return a success response
  const updatedUser = { id: 'test-user-id', credits: 100 + amount };
  
  res.json({ message: `${amount} credits added successfully`, user: updatedUser });
});

// Get pricing information
router.get('/pricing', (req, res) => {
  // Define pricing tiers
  const pricing = {
    tiers: [
      { name: 'Basic', cost: 10, credits: 100 },
      { name: 'Standard', cost: 25, credits: 250 },
      { name: 'Premium', cost: 50, credits: 550 },
      { name: 'Enterprise', cost: 100, credits: 1200 }
    ],
    // Cost per training session based on model type
    trainingCosts: {
      RNN: 5,
      CNN: 10,
      GPT: 15,
      RL: 20
    }
  };
  
  res.json(pricing);
});

module.exports = router;