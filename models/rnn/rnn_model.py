import sys
import json
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import SimpleRNN, Dense, LSTM, GRU
import numpy as np
import os

def create_rnn_model(input_size, hidden_size, output_size, layers, model_type='SimpleRNN'):
    """
    Create an RNN model based on the specified parameters
    """
    model = Sequential()
    
    # Add the first RNN layer
    if model_type == 'LSTM':
        model.add(LSTM(hidden_size, input_shape=(input_size, 1), return_sequences=layers > 1))
    elif model_type == 'GRU':
        model.add(GRU(hidden_size, input_shape=(input_size, 1), return_sequences=layers > 1))
    else:  # SimpleRNN
        model.add(SimpleRNN(hidden_size, input_shape=(input_size, 1), return_sequences=layers > 1))
    
    # Add additional layers if needed
    for i in range(layers - 1):
        if i == layers - 2:  # Last layer, don't return sequences
            if model_type == 'LSTM':
                model.add(LSTM(hidden_size, return_sequences=False))
            elif model_type == 'GRU':
                model.add(GRU(hidden_size, return_sequences=False))
            else:
                model.add(SimpleRNN(hidden_size, return_sequences=False))
        else:  # Hidden layers, return sequences
            if model_type == 'LSTM':
                model.add(LSTM(hidden_size, return_sequences=True))
            elif model_type == 'GRU':
                model.add(GRU(hidden_size, return_sequences=True))
            else:
                model.add(SimpleRNN(hidden_size, return_sequences=True))
    
    # Output layer
    model.add(Dense(output_size))
    
    return model

def train_model(parameters):
    """
    Train the RNN model with the given parameters
    """
    # Extract parameters
    input_size = parameters.get('inputSize', 100)
    hidden_size = parameters.get('hiddenSize', 128)
    output_size = parameters.get('outputSize', 10)
    layers = parameters.get('layers', 1)
    learning_rate = parameters.get('learningRate', 0.001)
    epochs = parameters.get('epochs', 10)
    batch_size = parameters.get('batchSize', 32)
    model_type = parameters.get('architecture', 'SimpleRNN')
    
    print(f"Creating {model_type} model with parameters: input_size={input_size}, hidden_size={hidden_size}, output_size={output_size}, layers={layers}")
    
    # Create the model
    model = create_rnn_model(input_size, hidden_size, output_size, layers, model_type)
    
    # Compile the model
    optimizer = tf.keras.optimizers.Adam(learning_rate=learning_rate)
    model.compile(optimizer=optimizer, loss='mse', metrics=['mae'])
    
    print("Model created successfully")
    print(model.summary())
    
    # Generate dummy data for training
    # In a real scenario, you would load actual data
    X_train = np.random.random((1000, input_size, 1))
    y_train = np.random.random((1000, output_size))
    
    X_val = np.random.random((200, input_size, 1))
    y_val = np.random.random((200, output_size))
    
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
    model.save('trained_model.h5')
    print("Model saved as 'trained_model.h5'")

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
            'inputSize': 100,
            'hiddenSize': 128,
            'outputSize': 10,
            'layers': 1,
            'learningRate': 0.001,
            'epochs': 10,
            'batchSize': 32,
            'architecture': 'SimpleRNN'
        }
        train_model(default_params)