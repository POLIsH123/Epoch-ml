const fs = require('fs');
const path = require('path');

// File-based storage for models
const MODELS_FILE = path.join(__dirname, '../data/models.json');
const TRAINING_SESSIONS_FILE = path.join(__dirname, '../data/training_sessions.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize files if they don't exist
if (!fs.existsSync(MODELS_FILE)) {
  fs.writeFileSync(MODELS_FILE, JSON.stringify([]));
}

if (!fs.existsSync(TRAINING_SESSIONS_FILE)) {
  fs.writeFileSync(TRAINING_SESSIONS_FILE, JSON.stringify([]));
}

// Get all models for a user
const getUserModels = (userId) => {
  const models = JSON.parse(fs.readFileSync(MODELS_FILE, 'utf8'));
  return models.filter(model => model.userId === userId);
};

// Get a specific model by ID and user ID
const getModelById = (modelId, userId) => {
  const models = JSON.parse(fs.readFileSync(MODELS_FILE, 'utf8'));
  return models.find(model => model._id === modelId && model.userId === userId);
};

// Add a new model
const addModel = (model) => {
  const models = JSON.parse(fs.readFileSync(MODELS_FILE, 'utf8'));
  models.push(model);
  fs.writeFileSync(MODELS_FILE, JSON.stringify(models, null, 2));
  return model;
};

// Update a model
const updateModel = (modelId, userId, updatedData) => {
  const models = JSON.parse(fs.readFileSync(MODELS_FILE, 'utf8'));
  const modelIndex = models.findIndex(model => model._id === modelId && model.userId === userId);
  if (modelIndex !== -1) {
    models[modelIndex] = { ...models[modelIndex], ...updatedData };
    fs.writeFileSync(MODELS_FILE, JSON.stringify(models, null, 2));
    return models[modelIndex];
  }
  return null;
};

// Delete a model
const deleteModel = (modelId, userId) => {
  const models = JSON.parse(fs.readFileSync(MODELS_FILE, 'utf8'));
  const modelIndex = models.findIndex(model => model._id === modelId && model.userId === userId);
  if (modelIndex !== -1) {
    models.splice(modelIndex, 1);
    fs.writeFileSync(MODELS_FILE, JSON.stringify(models, null, 2));
    return true;
  }
  return false;
};

// Find a model by ID (without checking user ID)
const findModel = (modelId) => {
  const models = JSON.parse(fs.readFileSync(MODELS_FILE, 'utf8'));
  return models.find(model => model._id === modelId);
};

// Training session functions
const getUserTrainingSessions = (userId) => {
  const sessions = JSON.parse(fs.readFileSync(TRAINING_SESSIONS_FILE, 'utf8'));
  return sessions.filter(session => session.userId === userId);
};

const addTrainingSession = (session) => {
  const sessions = JSON.parse(fs.readFileSync(TRAINING_SESSIONS_FILE, 'utf8'));
  sessions.push(session);
  fs.writeFileSync(TRAINING_SESSIONS_FILE, JSON.stringify(sessions, null, 2));
  return session;
};

const getTrainingSessions = () => {
  return JSON.parse(fs.readFileSync(TRAINING_SESSIONS_FILE, 'utf8'));
};

module.exports = {
  getUserModels,
  getModelById,
  addModel,
  updateModel,
  deleteModel,
  findModel,
  getUserTrainingSessions,
  addTrainingSession,
  getTrainingSessions
};