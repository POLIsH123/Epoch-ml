from abc import ABC, abstractmethod
import numpy as np


class BaseModel(ABC):
    """
    Abstract base class for all models in the Epoch-ml platform.
    Defines the standard interface that all models must implement.
    """
    
    def __init__(self, config):
        """
        Initialize the model with configuration parameters.
        
        Args:
            config (dict): Configuration parameters for the model
        """
        self.config = config
        self.model = None
        self.history = None
        
    @abstractmethod
    def build_model(self):
        """
        Build the model architecture based on the configuration.
        
        Returns:
            The built model object
        """
        pass
    
    @abstractmethod
    def train(self, X_train, y_train, X_val=None, y_val=None, epochs=10, batch_size=32):
        """
        Train the model on the provided data.
        
        Args:
            X_train: Training features
            y_train: Training labels
            X_val: Validation features (optional)
            y_val: Validation labels (optional)
            epochs: Number of training epochs
            batch_size: Size of training batches
        
        Returns:
            Training history object
        """
        pass
    
    @abstractmethod
    def predict(self, X):
        """
        Make predictions using the trained model.
        
        Args:
            X: Input data for prediction
        
        Returns:
            Predictions
        """
        pass
    
    @abstractmethod
    def save_model(self, filepath):
        """
        Save the trained model to a file.
        
        Args:
            filepath (str): Path to save the model
        """
        pass
    
    @abstractmethod
    def load_model(self, filepath):
        """
        Load a pre-trained model from a file.
        
        Args:
            filepath (str): Path to load the model from
        """
        pass
    
    @abstractmethod
    def get_training_history(self):
        """
        Get the training history of the model.
        
        Returns:
            Training history object or None
        """
        pass


class ModelFactory:
    """
    Factory class to create different types of models based on the model type.
    Supports neural networks (RNN, CNN, RL) and ensemble models (Random Forest, Gradient Boosting, XGBoost).
    """
    
    @staticmethod
    def create_model(model_type, config):
        """
        Create a model instance based on the model type.
        
        Args:
            model_type (str): Type of model to create 
                - Neural Networks: 'RNN', 'CNN', 'RL'
                - Ensemble: 'RANDOM_FOREST', 'GRADIENT_BOOSTING', 'XGBOOST'
            config (dict): Configuration parameters for the model
        
        Returns:
            Model instance
        """
        model_type_upper = model_type.upper()
        
        # Neural Network Models
        if model_type_upper == 'RNN':
            from .rnn.rnn_model import RNNModel
            return RNNModel(config)
        elif model_type_upper == 'CNN':
            from .cnn.cnn_model import CNNModel
            return CNNModel(config)
        elif model_type_upper == 'RL':
            raise NotImplementedError("Reinforcement Learning model not yet implemented")
        
        # Ensemble Models
        elif model_type_upper == 'RANDOM_FOREST' or model_type_upper == 'RANDOM':
            from .ensemble.random_forest import RandomForestModel
            return RandomForestModel(config)
        elif model_type_upper == 'GRADIENT_BOOSTING' or model_type_upper == 'GB':
            from .ensemble.gradient_boosting import GradientBoostingModel
            return GradientBoostingModel(config)
        elif model_type_upper == 'XGBOOST' or model_type_upper == 'XGB':
            from .ensemble.xgboost_model import XGBoostModel
            return XGBoostModel(config)
        
        else:
            raise ValueError(f"Unsupported model type: {model_type}. Supported types: RNN, CNN, RL, RANDOM_FOREST, GRADIENT_BOOSTING, XGBOOST")
