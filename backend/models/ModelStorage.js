// In-memory storage for models (shared across routes using global to persist across requests)
if (!global.modelsStorage) {
  global.modelsStorage = [];
}

// Get all models for a user
const getUserModels = (userId) => {
  return global.modelsStorage.filter(model => model.userId === userId);
};

// Get a specific model by ID and user ID
const getModelById = (modelId, userId) => {
  return global.modelsStorage.find(model => model._id === modelId && model.userId === userId);
};

// Add a new model
const addModel = (model) => {
  global.modelsStorage.push(model);
  return model;
};

// Update a model
const updateModel = (modelId, userId, updatedData) => {
  const modelIndex = global.modelsStorage.findIndex(model => model._id === modelId && model.userId === userId);
  if (modelIndex !== -1) {
    global.modelsStorage[modelIndex] = { ...global.modelsStorage[modelIndex], ...updatedData };
    return global.modelsStorage[modelIndex];
  }
  return null;
};

// Delete a model
const deleteModel = (modelId, userId) => {
  const modelIndex = global.modelsStorage.findIndex(model => model._id === modelId && model.userId === userId);
  if (modelIndex !== -1) {
    global.modelsStorage.splice(modelIndex, 1);
    return true;
  }
  return false;
};

// Find a model by ID (without checking user ID)
const findModel = (modelId) => {
  return global.modelsStorage.find(model => model._id === modelId);
};

module.exports = {
  getUserModels,
  getModelById,
  addModel,
  updateModel,
  deleteModel,
  findModel
};