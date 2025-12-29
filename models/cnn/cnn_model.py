import sys
import json
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
import numpy as np

def create_cnn_model(input_size, hidden_size, output_size, layers, learning_rate):
    """
    Create a CNN model based on the specified parameters
    """
    model = Sequential()
    
    # Calculate dimensions for 2D input
    # Assuming input_size is the flattened version of a square image
    img_size = int(input_size ** 0.5)
    
    # First convolutional layer
    model.add(Conv2D(hidden_size // 4, (3, 3), activation='relu', input_shape=(img_size, img_size, 1)))
    model.add(MaxPooling2D(2, 2))
    
    # Additional layers based on the 'layers' parameter
    for i in range(1, layers):
        # Increase filters with each layer, but cap it
        filters = min(hidden_size // 4 * (i + 1), hidden_size)
        model.add(Conv2D(filters, (3, 3), activation='relu'))
        model.add(MaxPooling2D(2, 2))
    
    # Flatten and dense layers
    model.add(Flatten())
    model.add(Dense(hidden_size, activation='relu'))
    model.add(Dropout(0.5))
    model.add(Dense(output_size, activation='softmax'))
    
    return model

def train_model(parameters):
    """
    Train the CNN model with the given parameters
    """
    # Extract parameters
    input_size = parameters.get('inputSize', 784)  # Default to 28x28 image
    hidden_size = parameters.get('hiddenSize', 128)
    output_size = parameters.get('outputSize', 10)
    layers = parameters.get('layers', 3)
    learning_rate = parameters.get('learningRate', 0.001)
    epochs = parameters.get('epochs', 10)
    batch_size = parameters.get('batchSize', 32)
    architecture = parameters.get('architecture', 'Conv2D')
    
    print(f"Creating CNN model with parameters: input_size={input_size}, hidden_size={hidden_size}, output_size={output_size}, layers={layers}")
    
    # Create the model
    model = create_cnn_model(input_size, hidden_size, output_size, layers, learning_rate)
    
    # Compile the model
    optimizer = tf.keras.optimizers.Adam(learning_rate=learning_rate)
    model.compile(optimizer=optimizer, loss='categorical_crossentropy', metrics=['accuracy'])
    
    print("Model created successfully")
    print(model.summary())
    
    # Generate dummy data for training
    # In a real scenario, you would load actual data
    img_size = int(input_size ** 0.5)
    X_train = np.random.random((1000, img_size, img_size, 1))
    y_train = tf.keras.utils.to_categorical(np.random.randint(output_size, size=(1000, 1)), output_size)
    
    X_val = np.random.random((200, img_size, img_size, 1))
    y_val = tf.keras.utils.to_categorical(np.random.randint(output_size, size=(200, 1)), output_size)
    
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
    model.save('trained_cnn_model.h5')
    print("Model saved as 'trained_cnn_model.h5'")

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
            'inputSize': 784,  # 28x28 image
            'hiddenSize': 128,
            'outputSize': 10,
            'layers': 3,
            'learningRate': 0.001,
            'epochs': 10,
            'batchSize': 32,
            'architecture': 'Conv2D'
        }
        train_model(default_params)