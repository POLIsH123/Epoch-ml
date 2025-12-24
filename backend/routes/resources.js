const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get user's current credits
router.get('/credits', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('credits');
    res.json({ credits: user.credits });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add credits to user account (simulated payment)
router.post('/add-credits', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    // In a real system, this would process a payment
    // For simulation, we'll just add credits
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $inc: { credits: amount } },
      { new: true }
    ).select('credits');
    
    res.json({ message: `${amount} credits added successfully`, user: updatedUser });
  
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pricing information
router.get('/pricing', authenticateToken, (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
