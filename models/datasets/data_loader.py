import numpy as np
import pandas as pd
from sklearn.datasets import (
    load_iris, load_wine, load_breast_cancer, 
    load_digits, make_classification, make_regression
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


class DataLoader:
    """
    Load and preprocess various datasets for model training.
    """
    
    @staticmethod
    def load_iris():
        """Load Iris dataset (classification)"""
        data = load_iris()
        X, y = data.data, data.target
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        scaler = StandardScaler()
        X_train = scaler.fit_transform(X_train)
        X_test = scaler.transform(X_test)
        return X_train, X_test, y_train, y_test, "Iris"
    
    @staticmethod
    def load_wine():
        """Load Wine dataset (classification)"""
        data = load_wine()
        X, y = data.data, data.target
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        scaler = StandardScaler()
        X_train = scaler.fit_transform(X_train)
        X_test = scaler.transform(X_test)
        return X_train, X_test, y_train, y_test, "Wine"
    
    @staticmethod
    def load_breast_cancer():
        """Load Breast Cancer dataset (binary classification)"""
        data = load_breast_cancer()
        X, y = data.data, data.target
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        scaler = StandardScaler()
        X_train = scaler.fit_transform(X_train)
        X_test = scaler.transform(X_test)
        return X_train, X_test, y_train, y_test, "Breast Cancer"
    
    @staticmethod
    def load_digits():
        """Load Digits dataset (classification)"""
        data = load_digits()
        X, y = data.data, data.target
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        scaler = StandardScaler()
        X_train = scaler.fit_transform(X_train)
        X_test = scaler.transform(X_test)
        return X_train, X_test, y_train, y_test, "Digits"
    
    @staticmethod
    def load_synthetic_classification(n_samples=1000, n_features=20, n_classes=3):
        """Generate synthetic classification dataset"""
        X, y = make_classification(
            n_samples=n_samples,
            n_features=n_features,
            n_informative=n_features - 5,
            n_redundant=5,
            n_classes=n_classes,
            random_state=42
        )
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        scaler = StandardScaler()
        X_train = scaler.fit_transform(X_train)
        X_test = scaler.transform(X_test)
        return X_train, X_test, y_train, y_test, f"Synthetic Classification ({n_samples} samples)"
    
    @staticmethod
    def load_synthetic_regression(n_samples=1000, n_features=20):
        """Generate synthetic regression dataset"""
        X, y = make_regression(
            n_samples=n_samples,
            n_features=n_features,
            n_informative=n_features - 5,
            random_state=42
        )
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        scaler = StandardScaler()
        X_train = scaler.fit_transform(X_train)
        X_test = scaler.transform(X_test)
        return X_train, X_test, y_train, y_test, f"Synthetic Regression ({n_samples} samples)"
    
    @staticmethod
    def get_available_datasets():
        """Return list of available datasets"""
        return [
            'iris',
            'wine',
            'breast_cancer',
            'digits',
            'synthetic_classification',
            'synthetic_regression'
        ]
    
    @staticmethod
    def load_dataset(dataset_name, **kwargs):
        """
        Load a dataset by name.
        
        Args:
            dataset_name (str): Name of the dataset
            **kwargs: Additional arguments for synthetic datasets
        
        Returns:
            Tuple of (X_train, X_test, y_train, y_test, dataset_name)
        """
        dataset_name = dataset_name.lower()
        
        if dataset_name == 'iris':
            return DataLoader.load_iris()
        elif dataset_name == 'wine':
            return DataLoader.load_wine()
        elif dataset_name == 'breast_cancer':
            return DataLoader.load_breast_cancer()
        elif dataset_name == 'digits':
            return DataLoader.load_digits()
        elif dataset_name == 'synthetic_classification':
            return DataLoader.load_synthetic_classification(**kwargs)
        elif dataset_name == 'synthetic_regression':
            return DataLoader.load_synthetic_regression(**kwargs)
        else:
            raise ValueError(f"Unknown dataset: {dataset_name}. Available: {DataLoader.get_available_datasets()}")
