const { body, validationResult } = require('express-validator');

// Validation middleware for user registration
const validateRegistration = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

// Validation middleware for user login
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Validation middleware for model training
const validateTraining = [
  body('modelId')
    .isMongoId()
    .withMessage('Invalid model ID'),
    
  body('parameters')
    .isObject()
    .withMessage('Parameters must be an object'),
    
  body('parameters.epochs')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Epochs must be an integer between 1 and 1000'),
    
  body('parameters.learningRate')
    .isFloat({ min: 0.0001, max: 1 })
    .withMessage('Learning rate must be a float between 0.0001 and 1'),
    
  body('parameters.batchSize')
    .isInt({ min: 1, max: 512 })
    .withMessage('Batch size must be an integer between 1 and 512'),
];

// Generic validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateTraining,
  handleValidationErrors
};
