// In-memory storage for models (shared across routes)
let modelsStorage = [];

// Get all models for a user
const getUserModels = (userId) => {
  return modelsStorage.filter(model => model.userId === userId);
};

// Get a specific model by ID and user ID
const getModelById = (modelId, userId) => {
  return modelsStorage.find(model => model._id === modelId && model.userId === userId);
};

// Add a new model
const addModel = (model) => {
  modelsStorage.push(model);
  return model;
};

// Update a model
const updateModel = (modelId, userId, updatedData) => {
  const modelIndex = modelsStorage.findIndex(model => model._id === modelId && model.userId === userId);
  if (modelIndex !== -1) {
    modelsStorage[modelIndex] = { ...modelsStorage[modelIndex], ...updatedData };
    return modelsStorage[modelIndex];
  }
  return null;
};

// Delete a model
const deleteModel = (modelId, userId) => {
  const modelIndex = modelsStorage.findIndex(model => model._id === modelId && model.userId === userId);
  if (modelIndex !== -1) {
    modelsStorage.splice(modelIndex, 1);
    return true;
  }
  return false;
};

// Find a model by ID (without checking user ID)
const findModel = (modelId) => {
  return modelsStorage.find(model => model._id === modelId);
};

module.exports = {
  getUserModels,
  getModelById,
  addModel,
  updateModel,
  deleteModel,
  findModel
};