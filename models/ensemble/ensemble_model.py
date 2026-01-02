from abc import abstractmethod
import numpy as np
import pickle
from sklearn.metrics import accuracy_score, mean_squared_error, f1_score
from models.base_model import BaseModel


class EnsembleModel(BaseModel):
    """
    Base class for ensemble models (Random Forest, Gradient Boosting, etc.)
    """
    
    def __init__(self, config):
        super().__init__(config)
        self.model = None
        self.history = {
            'train_loss': [],
            'train_accuracy': [],
            'val_loss': [],
            'val_accuracy': []
        }
        self.model_type = config.get('model_type', 'random_forest')
        self.task_type = config.get('task_type', 'classification')  # classification or regression
    
    @abstractmethod
    def build_model(self):
        """Build the ensemble model"""
        pass
    
    def train(self, X_train, y_train, X_val=None, y_val=None, epochs=10, batch_size=32):
        """
        Train the ensemble model.
        Ensemble models don't use epochs/batch_size like neural networks.
        """
        if self.model is None:
            self.build_model()
        
        # Train the model
        self.model.fit(X_train, y_train)
        
        # Evaluate on training data
        train_pred = self.model.predict(X_train)
        if self.task_type == 'classification':
            train_acc = accuracy_score(y_train, train_pred)
            train_loss = 1 - train_acc
        else:
            train_loss = mean_squared_error(y_train, train_pred)
            train_acc = 1 - (train_loss / np.var(y_train))
        
        self.history['train_loss'].append(train_loss)
        self.history['train_accuracy'].append(train_acc)
        
        # Evaluate on validation data if provided
        if X_val is not None and y_val is not None:
            val_pred = self.model.predict(X_val)
            if self.task_type == 'classification':
                val_acc = accuracy_score(y_val, val_pred)
                val_loss = 1 - val_acc
            else:
                val_loss = mean_squared_error(y_val, val_pred)
                val_acc = 1 - (val_loss / np.var(y_val))
            
            self.history['val_loss'].append(val_loss)
            self.history['val_accuracy'].append(val_acc)
        
        return self.history
    
    def predict(self, X):
        """Make predictions"""
        if self.model is None:
            raise ValueError("Model not trained yet")
        return self.model.predict(X)
    
    def save_model(self, filepath):
        """Save model to file"""
        if self.model is None:
            raise ValueError("No model to save")
        with open(filepath, 'wb') as f:
            pickle.dump(self.model, f)
    
    def load_model(self, filepath):
        """Load model from file"""
        with open(filepath, 'rb') as f:
            self.model = pickle.load(f)
    
    def get_training_history(self):
        """Get training history"""
        return self.history
