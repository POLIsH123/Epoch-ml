"""
Example script for training ensemble models with various datasets.
"""

from base_model import ModelFactory
from datasets.data_loader import DataLoader
import json


def train_ensemble_model(model_type, dataset_name, config=None):
    """
    Train an ensemble model on a specified dataset.
    
    Args:
        model_type (str): Type of ensemble model ('RANDOM_FOREST', 'GRADIENT_BOOSTING', 'XGBOOST')
        dataset_name (str): Name of dataset to use
        config (dict): Optional configuration overrides
    
    Returns:
        dict: Training results and metrics
    """
    
    # Load dataset
    print(f"Loading {dataset_name} dataset...")
    X_train, X_test, y_train, y_test, dataset_label = DataLoader.load_dataset(dataset_name)
    print(f"Dataset: {dataset_label}")
    print(f"Training samples: {X_train.shape[0]}, Features: {X_train.shape[1]}")
    print(f"Test samples: {X_test.shape[0]}")
    
    # Setup model config
    model_config = {
        'model_type': model_type.lower(),
        'task_type': 'classification',
        'n_estimators': 100,
        'random_state': 42
    }
    
    if config:
        model_config.update(config)
    
    # Create and train model
    print(f"\nTraining {model_type} model...")
    model = ModelFactory.create_model(model_type, model_config)
    model.build_model()
    
    history = model.train(X_train, y_train, X_test, y_test)
    
    # Evaluate
    train_pred = model.predict(X_train)
    test_pred = model.predict(X_test)
    
    from sklearn.metrics import accuracy_score, f1_score
    train_acc = accuracy_score(y_train, train_pred)
    test_acc = accuracy_score(y_test, test_pred)
    test_f1 = f1_score(y_test, test_pred, average='weighted')
    
    results = {
        'model_type': model_type,
        'dataset': dataset_label,
        'train_accuracy': float(train_acc),
        'test_accuracy': float(test_acc),
        'test_f1_score': float(test_f1),
        'history': history
    }
    
    print(f"\nResults:")
    print(f"  Train Accuracy: {train_acc:.4f}")
    print(f"  Test Accuracy: {test_acc:.4f}")
    print(f"  Test F1 Score: {test_f1:.4f}")
    
    return results


if __name__ == "__main__":
    # Example: Train Random Forest on Iris dataset
    results = train_ensemble_model('RANDOM_FOREST', 'iris')
    
    # Example: Train Gradient Boosting on Breast Cancer dataset
    # results = train_ensemble_model('GRADIENT_BOOSTING', 'breast_cancer')
    
    # Example: Train on synthetic data
    # results = train_ensemble_model('RANDOM_FOREST', 'synthetic_classification', 
    #                                 {'n_samples': 5000, 'n_features': 50})
    
    print("\nAvailable datasets:", DataLoader.get_available_datasets())
    print("Available models: RANDOM_FOREST, GRADIENT_BOOSTING, XGBOOST")
