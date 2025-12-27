import sys
import os
import json
import time
import tensorflow as tf
import numpy as np
from pymongo import MongoClient
from bson import ObjectId

# Config
MONGO_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/epoch-ml')
SAVED_MODELS_DIR = 'models/saved'

def update_session(session_id, status, progress=None, accuracy=None, loss=None):
    client = MongoClient(MONGO_URI)
    db = client.get_default_database()
    update_data = {'status': status}
    if progress is not None:
        update_data['progress'] = progress
    if accuracy is not None:
        update_data['accuracy'] = accuracy
    if loss is not None:
        update_data['loss'] = loss
    
    if status == 'completed':
        update_data['endTime'] = tf.timestamp().numpy() # Just a placeholder for date
    
    db.trainingsessions.update_one({'_id': ObjectId(session_id)}, {'$set': update_data})
    client.close()

def train(session_id, dataset_id, params_json):
    params = json.loads(params_json)
    print(f"Starting training for session {session_id} on dataset {dataset_id}")
    
    update_session(session_id, 'running')
    
    try:
        if dataset_id == 'dataset-1': # MNIST
            print("Loading MNIST dataset...")
            (x_train, y_train), (x_test, y_test) = tf.keras.datasets.mnist.load_data()
            x_train, x_test = x_train / 255.0, x_test / 255.0
            model = tf.keras.models.Sequential([
                tf.keras.layers.Flatten(input_shape=(28, 28)),
                tf.keras.layers.Dense(128, activation='relu'),
                tf.keras.layers.Dropout(0.2),
                tf.keras.layers.Dense(10, activation='softmax')
            ])
        elif dataset_id == 'dataset-2': # CIFAR-10
            print("Loading CIFAR-10 dataset...")
            (x_train, y_train), (x_test, y_test) = tf.keras.datasets.cifar10.load_data()
            x_train, x_test = x_train / 255.0, x_test / 255.0
            model = tf.keras.models.Sequential([
                tf.keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=(32, 32, 3)),
                tf.keras.layers.MaxPooling2D((2, 2)),
                tf.keras.layers.Flatten(),
                tf.keras.layers.Dense(64, activation='relu'),
                tf.keras.layers.Dense(10)
            ])
        elif dataset_id == 'dataset-13': # Stock Prices (Real Financial Data)
            import yfinance as yf
            print("Loading Stock Prices (AAPL) via yfinance...")
            data = yf.download('AAPL', period='5y', interval='1d')
            # Use 'Close' prices
            prices = data['Close'].values.reshape(-1, 1)
            # Create sequences for LSTM/RNN
            seq_length = 60
            X, y = [], []
            for i in range(len(prices) - seq_length):
                X.append(prices[i:i+seq_length])
                y.append(prices[i+seq_length])
            X, y = np.array(X), np.array(y)
            train_size = int(len(X) * 0.8)
            x_train, y_train = X[:train_size], y[:train_size]
            x_test, y_test = X[train_size:], y[train_size:]
            
            model = tf.keras.models.Sequential([
                tf.keras.layers.LSTM(50, return_sequences=True, input_shape=(seq_length, 1)),
                tf.keras.layers.LSTM(50, return_sequences=False),
                tf.keras.layers.Dense(25),
                tf.keras.layers.Dense(1)
            ])
        elif dataset_id == 'dataset-9': # Boston Housing (Real Tabular Data)
            print("Loading Boston Housing dataset...")
            (x_train, y_train), (x_test, y_test) = tf.keras.datasets.boston_housing.load_data()
            # Normalize
            mean = x_train.mean(axis=0)
            std = x_train.std(axis=0)
            x_train = (x_train - mean) / std
            x_test = (x_test - mean) / std
            
            model = tf.keras.models.Sequential([
                tf.keras.layers.Dense(64, activation='relu', input_shape=(x_train.shape[1],)),
                tf.keras.layers.Dense(64, activation='relu'),
                tf.keras.layers.Dense(1)
            ])
        else: # Default dummy
            print("Loading fallback dummy data...")
            x_train = np.random.random((100, 10))
            y_train = np.random.random((100, 1))
            x_test = np.random.random((20, 10))
            y_test = np.random.random((20, 1))
            model = tf.keras.models.Sequential([
                tf.keras.layers.Dense(32, activation='relu', input_shape=(10,)),
                tf.keras.layers.Dense(1)
            ])

        model.compile(optimizer='adam',
                      loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True) if dataset_id in ['dataset-1', 'dataset-2'] else 'mse',
                      metrics=['accuracy'] if dataset_id in ['dataset-1', 'dataset-2'] else ['mae'])

        # Create a custom callback to update progress
        class ProgressCallback(tf.keras.callbacks.Callback):
            def on_epoch_end(self, epoch, logs=None):
                acc = logs.get('accuracy') or logs.get('mae')
                loss = logs.get('loss')
                print(f"Epoch {epoch+1} ended. Accuracy/MAE: {acc}, Loss: {loss}")
                update_session(session_id, 'running', progress=(epoch + 1) / params.get('epochs', 5) * 100, accuracy=acc, loss=loss)

        epochs = params.get('epochs', 5)
        model.fit(x_train, y_train, epochs=epochs, callbacks=[ProgressCallback()])

        # Save model
        if not os.path.exists(SAVED_MODELS_DIR):
            os.makedirs(SAVED_MODELS_DIR)
        
        # We need to know which model ID this session belongs to
        client = MongoClient(MONGO_URI)
        db = client.get_default_database()
        session = db.trainingsessions.find_one({'_id': ObjectId(session_id)})
        model_id = session['modelId']
        client.close()

        save_path = os.path.join(SAVED_MODELS_DIR, f"{model_id}.h5")
        model.save(save_path)
        print(f"Model saved to {save_path}")

        update_session(session_id, 'completed', progress=100)

    except Exception as e:
        print(f"Training failed: {e}")
        update_session(session_id, 'failed')

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python train_model.py <session_id> <dataset_id> <params_json>")
        sys.exit(1)
    
    train(sys.argv[1], sys.argv[2], sys.argv[3])
