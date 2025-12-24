const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Model = require('../models/Model');

const router = express.Router();

// Get all available models
router.get('/', authenticateToken, async (req, res) => {
  try {
    const models = await Model.find({ isActive: true });
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific model by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const model = await Model.findById(req.params.id);
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }
    res.json(model);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new model (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    // TODO: Add admin role check
    const { name, type, description, architecture, parameters } = req.body;
    
    const model = new Model({
      name,
      type,
      description,
      architecture,
      parameters
    });
    
    await model.save();
    res.status(201).json(model);
  
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export/download a trained model
router.get('/:id/export', authenticateToken, async (req, res) => {
  try {
    // In a real implementation, this would return the trained model file
    // For now, we'll return a placeholder response
    const model = await Model.findById(req.params.id);
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    // Check if user has permission to export this model
    // (Either they created it or it's a public model)
    // TODO: Implement proper permissions
    
    // This would typically return a trained model file
    res.json({
      message: 'Model export endpoint',
      modelId: req.params.id,
      modelName: model.name,
      status: 'This is a placeholder for model export functionality'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
