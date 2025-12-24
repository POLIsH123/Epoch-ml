import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense, Embedding, MultiHeadAttention, LayerNormalization, Dropout
from tensorflow.keras.optimizers import Adam
import numpy as np
import json
import os

class GPTModel:
    def __init__(self, config):
        self.config = config
        self.model = None
        self.history = None
        
    def build_model(self):
        """Build the GPT model based on configuration"""
        # Input layer
        input_ids = Input(shape=(self.config.get('max_length', 128),), name='input_ids')
        
        # Embedding layer
        embedding_layer = Embedding(
            input_dim=self.config.get('vocab_size', 50257),
            output_dim=self.config.get('embedding_dim', 768),
            name='token_embedding'
        )
        embeddings = embedding_layer(input_ids)
        
        # Add positional encoding
        position_encoding = self._add_positional_encoding(embeddings)
        x = position_encoding
        
        # Add transformer blocks
        for i in range(self.config.get('num_layers', 12)):
            x = self._transformer_block(
                x, 
                self.config.get('num_heads', 12), 
                self.config.get('embedding_dim', 768),
                self.config.get('ff_dim', 3072),
                name=f'transformer_block_{i}'
            )
        
        # Add final layer normalization
        x = LayerNormalization()(x)
        
        # Output layer
        outputs = Dense(
            self.config.get('vocab_size', 50257),
            activation='softmax',
            name='output'
        )(x)
        
        # Create model
        model = Model(inputs=input_ids, outputs=outputs, name='GPTModel')
        
        # Compile model
        model.compile(
            optimizer=Adam(learning_rate=self.config.get('learning_rate', 5e-5)),
            loss=self.config.get('loss', 'sparse_categorical_crossentropy'),
            metrics=self.config.get('metrics', ['accuracy'])
        )
        
        self.model = model
        return model
    
    def _add_positional_encoding(self, embeddings):
        """Add positional encoding to embeddings"""
        seq_length = tf.shape(embeddings)[1]
        embedding_dim = tf.shape(embeddings)[2]
        
        # Create position indices
        positions = tf.range(start=0, limit=seq_length, delta=1)
        positions = tf.cast(positions, tf.float32)
        
        # Create positional encoding
        pos_encoding = tf.zeros((seq_length, embedding_dim))
        
        # Apply positional encoding
        position_indices = tf.expand_dims(positions, axis=1)  # (seq_length, 1)
        embedding_indices = tf.range(start=0, limit=embedding_dim, delta=1, dtype=tf.float32)
        embedding_indices = tf.expand_dims(embedding_indices, axis=0)  # (1, embedding_dim)
        
        # Calculate angle rates
        angle_rates = 1 / tf.pow(10000.0, (2 * (embedding_indices // 2)) / tf.cast(embedding_dim, tf.float32))
        
        # Calculate angles
        angles = position_indices * angle_rates
        
        # Apply sin to even indices and cos to odd indices
        angles = tf.where(tf.math.floormod(tf.cast(tf.range(embedding_dim), tf.int32), 2) == 0, 
                          tf.math.sin(angles), tf.math.cos(angles))
        
        # Add positional encoding to embeddings
        pos_encoding = tf.expand_dims(angles, axis=0)  # (1, seq_length, embedding_dim)
        pos_encoding = tf.cast(pos_encoding, embeddings.dtype)
        
        return embeddings + pos_encoding
    
    def _transformer_block(self, inputs, num_heads, embedding_dim, ff_dim, name):
        """Create a transformer block"""
        # Multi-head attention
        attention_output = MultiHeadAttention(
            num_heads=num_heads,
            key_dim=embedding_dim // num_heads,
            dropout=self.config.get('dropout_rate', 0.1)
        )(inputs, inputs)
        
        # Add & Norm
        attention_output = LayerNormalization()(inputs + attention_output)
        
        # Feed forward
        ffn_output = Dense(ff_dim, activation='relu')(attention_output)
        ffn_output = Dropout(self.config.get('dropout_rate', 0.1))(ffn_output)
        ffn_output = Dense(embedding_dim)(ffn_output)
        
        # Add & Norm
        output = LayerNormalization()(attention_output + ffn_output)
        
        return output
    
    def train(self, X_train, y_train, X_val=None, y_val=None, epochs=10, batch_size=32):
        """Train the GPT model"""
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
        "vocab_size": 50257,
        "max_length": 128,
        "embedding_dim": 768,
        "num_layers": 12,
        "num_heads": 12,
        "ff_dim": 3072,
        "learning_rate": 5e-5,
        "loss": "sparse_categorical_crossentropy",
        "metrics": ["accuracy"],
        "epochs": 3,
        "batch_size": 8
    }
    
    # Create model instance
    gpt_model = GPTModel(config)
    
    # Build the model
    model = gpt_model.build_model()
    print("Model built successfully!")
    print(model.summary())
