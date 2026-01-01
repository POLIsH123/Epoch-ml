# Ensemble Models & Datasets Guide

## Supported Ensemble Models

Your system now supports the following ensemble models:

### 1. **Random Forest**
- Classification and Regression
- Fast training, good for tabular data
- Base cost: 10 credits

### 2. **Gradient Boosting**
- Classification and Regression
- Sequential tree building for better accuracy
- Base cost: 10 credits

### 3. **XGBoost**
- Classification and Regression
- Optimized gradient boosting implementation
- Base cost: 10 credits

## Available Datasets

### Tabular Datasets (Compatible with Ensemble Models)

1. **Iris** (`iris`)
   - 150 samples, 4 features
   - 3 classes (flower species)
   - Classification task

2. **Wine** (`wine`)
   - 178 samples, 13 features
   - 3 classes (wine cultivars)
   - Classification task

3. **Breast Cancer** (`breast_cancer`)
   - 569 samples, 30 features
   - Binary classification (malignant/benign)
   - Classification task

4. **Digits** (`digits`)
   - 1,797 samples, 64 features
   - 10 classes (digits 0-9)
   - Classification task

5. **Boston Housing** (`dataset-9`)
   - 506 samples, 13 features
   - Regression task (house prices)

### Image Datasets (Neural Networks Only)

- **MNIST** (`dataset-1`) - Handwritten digits
- **CIFAR-10** (`dataset-2`) - Small images
- **Stock Prices** (`dataset-3`) - Time series

### Text Datasets (Neural Networks Only)

- **News Headlines Sentiment** (`dataset-4`) - Text classification

## How to Use

### From Frontend

1. Go to **Models** page
2. Click **Create Model**
3. Select model type:
   - `Random Forest`
   - `Gradient Boosting`
   - `XGBoost`
4. Go to **Train** page
5. Select your ensemble model
6. Select a compatible tabular dataset (iris, wine, breast_cancer, digits, or dataset-9)
7. Click **Start Training**

### From Python

```python
from models.base_model import ModelFactory
from models.datasets.data_loader import DataLoader

# Load dataset
X_train, X_test, y_train, y_test, name = DataLoader.load_dataset('iris')

# Create model
config = {
    'model_type': 'random_forest',
    'task_type': 'classification',
    'n_estimators': 100,
    'random_state': 42
}
model = ModelFactory.create_model('RANDOM_FOREST', config)

# Train
model.build_model()
history = model.train(X_train, y_train, X_test, y_test)

# Predict
predictions = model.predict(X_test)

# Save
model.save_model('my_model.pkl')
```

## Model Configuration

### Random Forest Parameters

```python
config = {
    'n_estimators': 100,      # Number of trees
    'max_depth': None,        # Max tree depth
    'min_samples_split': 2,   # Min samples to split
    'min_samples_leaf': 1,    # Min samples in leaf
    'random_state': 42
}
```

### Gradient Boosting Parameters

```python
config = {
    'n_estimators': 100,      # Number of boosting stages
    'learning_rate': 0.1,     # Shrinkage parameter
    'max_depth': 3,           # Max tree depth
    'subsample': 1.0,         # Fraction of samples for fitting
    'random_state': 42
}
```

### XGBoost Parameters

```python
config = {
    'n_estimators': 100,
    'learning_rate': 0.1,
    'max_depth': 6,
    'subsample': 1.0,
    'random_state': 42
}
```

## Available Datasets in DataLoader

```python
from models.datasets.data_loader import DataLoader

# Get list of available datasets
datasets = DataLoader.get_available_datasets()
# Returns: ['iris', 'wine', 'breast_cancer', 'digits', 'synthetic_classification', 'synthetic_regression']

# Load any dataset
X_train, X_test, y_train, y_test, name = DataLoader.load_dataset('iris')

# Load synthetic data with custom parameters
X_train, X_test, y_train, y_test, name = DataLoader.load_dataset(
    'synthetic_classification',
    n_samples=5000,
    n_features=50,
    n_classes=3
)
```

## Training Costs

- **Ensemble Models**: 10 credits base
- Cost multipliers apply based on parameters:
  - Epochs multiplier: `epochs / 5`
  - Batch size multiplier: `64 / batch_size`
  - Learning rate multiplier: `0.001 / learning_rate`

Example: Random Forest with default params = 10 credits

## Notes

- Ensemble models train much faster than neural networks
- They work best with tabular/structured data
- No GPU acceleration needed
- Models are saved as `.pkl` files (pickle format)
- Neural networks are saved as `.h5` files (HDF5 format)
