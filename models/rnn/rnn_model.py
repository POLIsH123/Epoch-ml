import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import SimpleRNN, Dense, Embedding
from tensorflow.keras.optimizers import Adam
import numpy as np
import json
import os

class RNNModel:
    def __init__(self, config):
        self.config = config
        self.model = None
        self.history = None
        
    def build_model(self):
        """Build the RNN model based on configuration"""
        model = Sequential()
        
        # Add embedding layer if vocab_size is provided
        if 'vocab_size' in self.config and self.config.get('use_embedding', True):
            model.add(Embedding(
                input_dim=self.config['vocab_size'],
                output_dim=self.config.get('embedding_dim', 100),
                input_length=self.config.get('input_length', 100)
            ))
        
        # Add RNN layer(s)
        model.add(SimpleRNN(
            units=self.config.get('hidden_size', 128),
            return_sequences=self.config.get('return_sequences', False),
            dropout=self.config.get('dropout', 0.2),
            recurrent_dropout=self.config.get('recurrent_dropout', 0.2)
        ))
        
        # Add output layer
        model.add(Dense(
            units=self.config.get('output_size', 1),
            activation=self.config.get('output_activation', 'sigmoid')
        ))
        
        # Compile model
        model.compile(
            optimizer=Adam(learning_rate=self.config.get('learning_rate', 0.001)),
            loss=self.config.get('loss', 'binary_crossentropy'),
            metrics=self.config.get('metrics', ['accuracy'])
        )
        
        self.model = model
        return model
    
    def train(self, X_train, y_train, X_val=None, y_val=None, epochs=10, batch_size=32):
        """Train the RNN model"""
        if self.model is None:
            self.build_model()
        
        # Prepare validation data
        validation_data = None
        if X_val is not None and y_val is not None:
            validation_data = (X_val, y_val)
        
        # Train the model
        self.history = self.model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_data=validation_data,
            verbose=1
        )
        
        return self.history
    
    def predict(self, X):
        """Make predictions with the trained model"""
        if self.model is None:
            raise ValueError("Model not built yet. Call build_model() first.")
        return self.model.predict(X)
    
    def save_model(self, filepath):
        """Save the trained model"""
        if self.model is None:
            raise ValueError("Model not built yet. Call build_model() first.")
        self.model.save(filepath)
    
    def load_model(self, filepath):
        """Load a pre-trained model"""
        self.model = tf.keras.models.load_model(filepath)
    
    def get_training_history(self):
        """Return training history"""
        return self.history.history if self.history else None

# Example usage
if __name__ == "__main__":
    # Example configuration
    config = {
        "vocab_size": 10000,
        "embedding_dim": 100,
        "hidden_size": 128,
        "output_size": 1,
        "learning_rate": 0.001,
        "loss": "binary_crossentropy",
        "metrics": ["accuracy"],
        "epochs": 10,
        "batch_size": 32
    }
    
    # Create model instance
    rnn_model = RNNModel(config)
    
    # Build the model
    model = rnn_model.build_model()
    print("Model built successfully!")
    print(model.summary())
