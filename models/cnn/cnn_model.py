import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.optimizers import Adam
import numpy as np
import json
import os

class CNNModel:
    def __init__(self, config):
        self.config = config
        self.model = None
        self.history = None
        
    def build_model(self):
        """Build the CNN model based on configuration"""
        model = Sequential()
        
        # Add convolutional layers
        for i, (filters, kernel_size) in enumerate(zip(
            self.config.get('filters_list', [32, 64, 128]), 
            self.config.get('kernel_sizes', [3, 3, 3]))):
            
            model.add(Conv2D(
                filters=filters,
                kernel_size=(kernel_size, kernel_size),
                activation=self.config.get('activation', 'relu'),
                input_shape=self.config.get('input_shape') if i == 0 else None
            ))
            
            if self.config.get('use_maxpooling', True):
                model.add(MaxPooling2D(pool_size=(2, 2)))
            
            if self.config.get('use_dropout', True):
                model.add(Dropout(self.config.get('dropout_rate', 0.25)))
        
        # Add flatten layer
        model.add(Flatten())
        
        # Add dense layers
        for units in self.config.get('dense_units', [128, 64]):
            model.add(Dense(
                units=units,
                activation=self.config.get('activation', 'relu')
            ))
            
            if self.config.get('use_dropout', True):
                model.add(Dropout(self.config.get('dropout_rate', 0.5)))
        
        # Add output layer
        model.add(Dense(
            units=self.config.get('output_size', 10),
            activation=self.config.get('output_activation', 'softmax')
        ))
        
        # Compile model
        model.compile(
            optimizer=Adam(learning_rate=self.config.get('learning_rate', 0.001)),
            loss=self.config.get('loss', 'categorical_crossentropy'),
            metrics=self.config.get('metrics', ['accuracy'])
        )
        
        self.model = model
        return model
    
    def train(self, X_train, y_train, X_val=None, y_val=None, epochs=10, batch_size=32):
        """Train the CNN model"""
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
        "input_shape": (28, 28, 1),  # For MNIST-like data
        "filters_list": [32, 64, 128],
        "kernel_sizes": [3, 3, 3],
        "dense_units": [128, 64],
        "output_size": 10,
        "learning_rate": 0.001,
        "loss": "categorical_crossentropy",
        "metrics": ["accuracy"],
        "epochs": 10,
        "batch_size": 32
    }
    
    # Create model instance
    cnn_model = CNNModel(config)
    
    # Build the model
    model = cnn_model.build_model()
    print("Model built successfully!")
    print(model.summary())
