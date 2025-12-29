import sys
import json
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense, MultiHeadAttention, LayerNormalization, Dropout, Embedding, GlobalAveragePooling1D
import numpy as np

def create_transformer_block(embed_dim, num_heads, ff_dim, rate=0.1):
    """
    Create a transformer block with multi-head attention and feed-forward layers
    """
    inputs = Input(shape=(None,))
    
    # Multi-head attention
    attention_output = MultiHeadAttention(num_heads=num_heads, key_dim=embed_dim)(inputs, inputs)
    attention_output = Dropout(rate)(attention_output)
    out1 = LayerNormalization(epsilon=1e-6)(inputs + attention_output)
    
    # Feed-forward network
    ffn_output = Dense(ff_dim, activation="relu")(out1)
    ffn_output = Dropout(rate)(ffn_output)
    out2 = LayerNormalization(epsilon=1e-6)(out1 + ffn_output)
    
    return Model(inputs, out2)

def create_gpt_model(input_size, hidden_size, output_size, layers, num_heads=8):
    """
    Create a GPT model based on the specified parameters
    """
    inputs = Input(shape=(input_size,))
    
    # Embedding layer
    embedding = Embedding(input_size, hidden_size)(inputs)
    
    # Transformer blocks
    x = embedding
    for _ in range(layers):
        transformer_block = create_transformer_block(hidden_size, num_heads, hidden_size * 4)
        x = transformer_block(x)
    
    # Global average pooling to reduce dimensions
    x = GlobalAveragePooling1D()(x)
    
    # Output layer
    outputs = Dense(output_size, activation='softmax')(x)
    
    model = Model(inputs, outputs)
    return model

def train_model(parameters):
    """
    Train the GPT model with the given parameters
    """
    # Extract parameters
    input_size = parameters.get('inputSize', 512)
    hidden_size = parameters.get('hiddenSize', 768)
    output_size = parameters.get('outputSize', 30522)  # Size of vocab for BERT-like models
    layers = parameters.get('layers', 12)
    num_heads = min(12, hidden_size // 64)  # Calculate appropriate number of heads
    learning_rate = parameters.get('learningRate', 0.00002)
    epochs = parameters.get('epochs', 3)
    batch_size = parameters.get('batchSize', 16)
    architecture = parameters.get('architecture', 'Transformer')
    
    print(f"Creating GPT model with parameters: input_size={input_size}, hidden_size={hidden_size}, output_size={output_size}, layers={layers}")
    
    # Create the model
    model = create_gpt_model(input_size, hidden_size, output_size, layers, num_heads)
    
    # Compile the model
    optimizer = tf.keras.optimizers.Adam(learning_rate=learning_rate)
    model.compile(optimizer=optimizer, loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    
    print("Model created successfully")
    print(model.summary())
    
    # Generate dummy data for training
    # In a real scenario, you would load actual text data
    X_train = np.random.randint(0, input_size, size=(100, input_size))
    y_train = np.random.randint(0, output_size, size=(100,))
    
    X_val = np.random.randint(0, input_size, size=(20, input_size))
    y_val = np.random.randint(0, output_size, size=(20,))
    
    print("Starting training...")
    
    # Training with progress reporting
    for epoch in range(epochs):
        # Report progress (0-100%)
        progress = int((epoch / epochs) * 100)
        print(f"PROGRESS:{progress}")
        sys.stdout.flush()
        
        # Train for one epoch
        history = model.fit(
            X_train, y_train,
            batch_size=batch_size,
            epochs=1,
            validation_data=(X_val, y_val),
            verbose=0
        )
    
    # Report final progress
    print("PROGRESS:100")
    sys.stdout.flush()
    
    print("Training completed successfully")
    
    # Save the model
    model.save('trained_gpt_model.h5')
    print("Model saved as 'trained_gpt_model.h5'")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Get parameters from command line argument
        params_str = sys.argv[1]
        parameters = json.loads(params_str)
        
        # Train the model
        train_model(parameters)
    else:
        print("No parameters provided. Using default values.")
        default_params = {
            'inputSize': 512,
            'hiddenSize': 768,
            'outputSize': 30522,
            'layers': 12,
            'learningRate': 0.00002,
            'epochs': 3,
            'batchSize': 16,
            'architecture': 'Transformer'
        }
        train_model(default_params)