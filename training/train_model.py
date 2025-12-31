import sys
import os
import json
import time
import tensorflow as tf
import numpy as np
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime

# Suppress TensorFlow noise
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

# Config
MONGO_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/epoch-ml')
SAVED_MODELS_DIR = 'models/saved'

def update_session(session_id, status, progress=None, accuracy=None, loss=None, metric_name=None, accuracy_percent=None, loss_percent=None, current_epoch=None, total_epochs=None, db=None):
    close_at_end = False
    if db is None:
        client = MongoClient(MONGO_URI)
        db = client.get_default_database()
        close_at_end = True
    
    update_data = {'status': status}
    if progress is not None:
        update_data['progress'] = progress
    if accuracy is not None:
        update_data['accuracy'] = accuracy
    if loss is not None:
        update_data['loss'] = loss
    if metric_name is not None:
        update_data['metricName'] = metric_name
    if accuracy_percent is not None:
        update_data['accuracyPercent'] = accuracy_percent
    if loss_percent is not None:
        update_data['lossPercent'] = loss_percent
    if current_epoch is not None:
        update_data['currentEpoch'] = current_epoch
    if total_epochs is not None:
        update_data['totalEpochs'] = total_epochs
    
    if status == 'completed':
        update_data['endTime'] = datetime.utcnow()
    
    db.trainingsessions.update_one({'_id': ObjectId(session_id)}, {'$set': update_data})
    
    if close_at_end:
        db.client.close()

def train(session_id, dataset_id, params_json):
    params = json.loads(params_json)
    client = MongoClient(MONGO_URI)
    db = client.get_default_database()
    
    print(f"Starting training for session {session_id} on dataset {dataset_id}")
    update_session(session_id, 'running', db=db)
    
    try:
        if dataset_id == 'dataset-1': # MNIST
            print("Loading MNIST dataset...")
            (x_train, y_train), (x_test, y_test) = tf.keras.datasets.mnist.load_data()
            # Use only a subset of the data for faster training
            x_train, y_train = x_train[:5000], y_train[:5000]  # Reduced training data
            x_test, y_test = x_test[:1000], y_test[:1000]  # Reduced test data
            x_train, x_test = x_train / 255.0, x_test / 255.0
            model = tf.keras.models.Sequential([
                tf.keras.layers.Flatten(input_shape=(28, 28)),
                tf.keras.layers.Dense(64, activation='relu'),  # Reduced units
                tf.keras.layers.Dropout(0.2),
                tf.keras.layers.Dense(10, activation='softmax')
            ])
        elif dataset_id == 'dataset-2': # CIFAR-10
            print("Loading CIFAR-10 dataset...")
            (x_train, y_train), (x_test, y_test) = tf.keras.datasets.cifar10.load_data()
            # Use only a subset of the data for faster training
            x_train, y_train = x_train[:3000], y_train[:3000]  # Reduced training data
            x_test, y_test = x_test[:500], y_test[:500]  # Reduced test data
            x_train, x_test = x_train / 255.0, x_test / 255.0
            model = tf.keras.models.Sequential([
                tf.keras.layers.Conv2D(16, (3, 3), activation='relu', input_shape=(32, 32, 3)),  # Reduced filters
                tf.keras.layers.MaxPooling2D((2, 2)),
                tf.keras.layers.Flatten(),
                tf.keras.layers.Dense(32, activation='relu'),  # Reduced units
                tf.keras.layers.Dense(10)
            ])
        elif dataset_id == 'dataset-3': # CIFAR-100
            print("Loading CIFAR-100 dataset...")
            (x_train, y_train), (x_test, y_test) = tf.keras.datasets.cifar100.load_data()
            # Use only a subset of the data for faster training
            x_train, y_train = x_train[:2000], y_train[:2000]  # Reduced training data
            x_test, y_test = x_test[:300], y_test[:300]  # Reduced test data
            x_train, x_test = x_train / 255.0, x_test / 255.0
            model = tf.keras.models.Sequential([
                tf.keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=(32, 32, 3)),  # Reduced filters
                tf.keras.layers.MaxPooling2D((2, 2)),
                tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),  # Reduced filters
                tf.keras.layers.MaxPooling2D((2, 2)),
                tf.keras.layers.Flatten(),
                tf.keras.layers.Dense(128, activation='relu'),  # Reduced units
                tf.keras.layers.Dense(100)
            ])
        elif dataset_id == 'dataset-13': # Stock Prices (Real Financial Data)
            import yfinance as yf
            print("Loading Stock Prices (AAPL) via yfinance...")
            data = yf.download('AAPL', period='6mo', interval='1d')  # Reduced to 6 months
            # Use 'Close' prices
            prices = data['Close'].values.reshape(-1, 1)
            # Create sequences for LSTM/RNN
            seq_length = 30  # Reduced sequence length
            X, y = [], []
            for i in range(0, min(len(prices) - seq_length, 300), 5):  # Sample every 5th point, max 300 samples
                X.append(prices[i:i+seq_length])
                y.append(prices[i+seq_length])
            X, y = np.array(X), np.array(y)
            train_size = int(len(X) * 0.7)  # Reduced train size
            x_train, y_train = X[:train_size], y[:train_size]
            x_test, y_test = X[train_size:], y[train_size:]
            
            model = tf.keras.models.Sequential([
                tf.keras.layers.LSTM(25, return_sequences=True, input_shape=(seq_length, 1)),  # Reduced units
                tf.keras.layers.LSTM(25, return_sequences=False),  # Reduced units
                tf.keras.layers.Dense(10),  # Reduced units
                tf.keras.layers.Dense(1)
            ])
        elif dataset_id == 'dataset-9': # Boston Housing (Real Tabular Data)
            print("Loading Boston Housing dataset...")
            (x_train, y_train), (x_test, y_test) = tf.keras.datasets.boston_housing.load_data()
            # Use only a subset of the data for faster training
            x_train, y_train = x_train[:400], y_train[:400]  # Reduced training data
            x_test, y_test = x_test[:100], y_test[:100]  # Reduced test data
            # Normalize
            mean = x_train.mean(axis=0)
            std = x_train.std(axis=0)
            x_train = (x_train - mean) / std
            x_test = (x_test - mean) / std
            
            model = tf.keras.models.Sequential([
                tf.keras.layers.Dense(32, activation='relu', input_shape=(x_train.shape[1],)),  # Reduced units
                tf.keras.layers.Dense(16, activation='relu'),  # Reduced units
                tf.keras.layers.Dense(1)
            ])
        else: # Default dummy
            print("Loading fallback dummy data...")
            x_train = np.random.random((50, 10))  # Reduced training data
            y_train = np.random.random((50, 1))
            x_test = np.random.random((10, 10))  # Reduced test data
            y_test = np.random.random((10, 1))
            model = tf.keras.models.Sequential([
                tf.keras.layers.Dense(16, activation='relu', input_shape=(10,)),  # Reduced units
                tf.keras.layers.Dense(1)
            ])

        model.compile(optimizer='adam',
                      loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True) if dataset_id in ['dataset-1', 'dataset-2', 'dataset-3'] else 'mse',
                      metrics=['accuracy'] if dataset_id in ['dataset-1', 'dataset-2', 'dataset-3'] else ['mae'])

        metric_name = 'Accuracy' if dataset_id in ['dataset-1', 'dataset-2', 'dataset-3'] else 'MAE'
        y_mean = np.mean(y_train) if dataset_id not in ['dataset-1', 'dataset-2', 'dataset-3'] else 1.0
        initial_loss = [None] # Use list to make it mutable in callback

        epochs = params.get('epochs', 5)
        
        # Create a custom callback to update progress
        class ProgressCallback(tf.keras.callbacks.Callback):
            def on_epoch_end(self, epoch, logs=None):
                current_loss = logs.get('loss')
                
                if initial_loss[0] is None:
                    initial_loss[0] = current_loss
                
                # Extract appropriate metric based on dataset type
                if dataset_id in ['dataset-1', 'dataset-2', 'dataset-3']:  # Classification
                    # Look for accuracy metrics in the logs
                    acc = logs.get('accuracy') or logs.get('acc') or logs.get('val_accuracy') or logs.get('val_acc')
                    
                    # Calculate accuracy percent
                    acc_pct = acc * 100 if acc is not None else 0
                else:  # Regression
                    # Look for MAE metrics in the logs
                    acc = logs.get('mae') or logs.get('val_mae')
                    
                    # For regression, calculate accuracy as 100 - (MAE / Mean * 100)
                    acc_pct = max(0, 100 * (1 - acc / y_mean)) if acc is not None and y_mean != 0 else 0
                
                # Calculate loss percent (improvement compared to start)
                loss_pct = (current_loss / initial_loss[0] * 100) if initial_loss[0] != 0 else 0
                
                # Ensure metrics are native Python floats and not None or NaN
                acc = float(acc) if acc is not None and np.isfinite(acc) else 0.0
                current_loss = float(current_loss) if current_loss is not None and np.isfinite(current_loss) else 0.0
                acc_pct = float(acc_pct) if acc_pct is not None and np.isfinite(acc_pct) else 0.0
                loss_pct = float(loss_pct) if loss_pct is not None and np.isfinite(loss_pct) else 0.0

                print(f"Epoch {epoch+1}/{epochs} ended. {metric_name}: {acc} ({acc_pct:.2f}%), Loss: {current_loss} ({loss_pct:.2f}%)")
                print(f"Debug: acc={acc}, current_loss={current_loss}, acc_pct={acc_pct}, loss_pct={loss_pct}, initial_loss[0]={initial_loss[0]}, y_mean={y_mean}")
                update_session(session_id, 'running', 
                               progress=(epoch + 1) / epochs * 100, 
                               accuracy=acc, 
                               loss=current_loss, 
                               metric_name=metric_name,
                               accuracy_percent=acc_pct,
                               loss_percent=loss_pct,
                               current_epoch=epoch + 1,
                               total_epochs=epochs,
                               db=db)

        model.fit(x_train, y_train, epochs=epochs, callbacks=[ProgressCallback()], verbose=0)
        
        # Evaluate the model to get final metrics after training
        final_metrics = model.evaluate(x_test, y_test, verbose=0)
        if isinstance(final_metrics, (list, tuple)):
            final_loss = final_metrics[0]
            # For classification (dataset-1,2,3), second value is accuracy
            # For regression (dataset-9,13), second value is mae
            if len(final_metrics) > 1:
                if dataset_id in ['dataset-1', 'dataset-2', 'dataset-3']:
                    final_accuracy = final_metrics[1]
                    final_mae = None
                else:
                    final_accuracy = None
                    final_mae = final_metrics[1]
            else:
                final_accuracy = None
                final_mae = None
        else:
            final_loss = final_metrics
            final_accuracy = None
            final_mae = None
        
        # Save model
        if not os.path.exists(SAVED_MODELS_DIR):
            os.makedirs(SAVED_MODELS_DIR)
        
        session = db.trainingsessions.find_one({'_id': ObjectId(session_id)})
        model_id = session['modelId']
        
        save_path = os.path.join(SAVED_MODELS_DIR, f"{model_id}.h5")
        model.save(save_path)
        print(f"Model saved to {save_path}")

        # Update session with final metrics
        # Determine metric name for final update
        final_metric_name = 'Accuracy' if dataset_id in ['dataset-1', 'dataset-2', 'dataset-3'] else 'MAE'
        # Use appropriate metric value based on dataset type
        metric_value = final_accuracy if final_accuracy is not None else final_mae
        
        # Calculate final accuracy and loss percentages
        final_acc_pct = metric_value * 100 if metric_value is not None else 0
        if initial_loss[0] is not None and initial_loss[0] != 0 and final_loss is not None:
            final_loss_pct = (final_loss / initial_loss[0] * 100)
        else:
            final_loss_pct = 0

        print(f"Final metrics: accuracy={metric_value}, loss={final_loss}, accuracy_percent={final_acc_pct}, loss_percent={final_loss_pct}")
        
        update_session(session_id, 'completed', progress=100, total_epochs=epochs, current_epoch=epochs, accuracy=metric_value, loss=final_loss, metric_name=final_metric_name, accuracy_percent=final_acc_pct, loss_percent=final_loss_pct, db=db)

    except Exception as e:
        print(f"Training failed: {e}")
        update_session(session_id, 'failed', db=db)
    finally:
        client.close()

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python train_model.py <session_id> <dataset_id> <params_json>")
        sys.exit(1)
    
    train(sys.argv[1], sys.argv[2], sys.argv[3])
