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
    
    data_source_type = "Dummy" # Default to dummy
    if dataset_id in ['dataset-1', 'dataset-2', 'dataset-3', 'dataset-9', 'dataset-13']:
        data_source_type = "Real"
    print(f"Data source type: {data_source_type}")

    update_session(session_id, 'running', db=db)
    
    # Get model architecture from session
    session = db.trainingsessions.find_one({'_id': ObjectId(session_id)})
    model_architecture = None
    if session and 'modelId' in session:
        model_doc = db.models.find_one({'_id': ObjectId(session['modelId'])})
        if model_doc:
            model_architecture = model_doc.get('architecture', None)
    print(f"Model architecture: {model_architecture}")
    
    # Check if using ensemble model (case-insensitive)
    ensemble_types = ['Random Forest', 'Gradient Boosting', 'XGBoost', 'LightGBM', 'random forest', 'gradient boosting', 'xgboost', 'lightgbm', 'RandomForest', 'GradientBoosting']
    use_ensemble = model_architecture and any(ensemble_type.lower() == model_architecture.lower() for ensemble_type in ensemble_types)
    
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
        elif dataset_id == 'dataset-3': # Stock Prices
            import yfinance as yf
            print("Loading Stock Prices (AAPL) via yfinance...")
            data = yf.download('AAPL', period='6mo', interval='1d')
            prices = data['Close'].values.reshape(-1, 1)
            seq_length = 30
            X, y = [], []
            for i in range(0, min(len(prices) - seq_length, 300), 5):
                X.append(prices[i:i+seq_length])
                y.append(prices[i+seq_length])
            X, y = np.array(X), np.array(y)
            train_size = int(len(X) * 0.7)
            x_train, y_train = X[:train_size], y[:train_size]
            x_test, y_test = X[train_size:], y[train_size:]
            
            model = tf.keras.models.Sequential([
                tf.keras.layers.LSTM(25, return_sequences=True, input_shape=(seq_length, 1)),
                tf.keras.layers.LSTM(25, return_sequences=False),
                tf.keras.layers.Dense(10),
                tf.keras.layers.Dense(1)
            ])

        elif dataset_id == 'dataset-4': # News Headlines Sentiment
            print("Loading News Headlines Sentiment (dummy data)...")
            # Generate dummy data for text classification (e.g., GRU/LSTM input)
            vocab_size = 1000
            max_sequence_length = 50
            num_classes = 3 # e.g., positive, negative, neutral
            num_samples = 1000 # Reduced samples for faster training

            x_train = np.random.randint(0, vocab_size, size=(num_samples, max_sequence_length))
            y_train = np.random.randint(0, num_classes, size=(num_samples, 1))
            x_test = np.random.randint(0, vocab_size, size=(num_samples // 5, max_sequence_length))
            y_test = np.random.randint(0, num_classes, size=(num_samples // 5, 1))

            model = tf.keras.models.Sequential([
                tf.keras.layers.Embedding(vocab_size, 64, input_length=max_sequence_length),
                tf.keras.layers.GRU(32), # Reduced units
                tf.keras.layers.Dense(num_classes, activation='softmax')
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
            
            # Use TensorFlow for neural networks (if not ensemble)
            if not use_ensemble:
                model = tf.keras.models.Sequential([
                    tf.keras.layers.Dense(32, activation='relu', input_shape=(x_train.shape[1],)),  # Reduced units
                    tf.keras.layers.Dense(16, activation='relu'),  # Reduced units
                    tf.keras.layers.Dense(1)
                ])
        elif dataset_id == 'dataset-13': # Iris Classification (Real Tabular Data)
            from sklearn.datasets import load_iris
            from sklearn.model_selection import train_test_split
            print("Loading Iris dataset...")
            iris = load_iris()
            x_train, x_test, y_train, y_test = train_test_split(iris.data, iris.target, test_size=0.2, random_state=42)
            
            # Use TensorFlow for neural networks (if not ensemble)
            if not use_ensemble:
                model = tf.keras.models.Sequential([
                    tf.keras.layers.Dense(32, activation='relu', input_shape=(x_train.shape[1],)),
                    tf.keras.layers.Dense(16, activation='relu'),
                    tf.keras.layers.Dense(3, activation='softmax')
                ])
        elif dataset_id == 'iris':
            from sklearn.datasets import load_iris
            from sklearn.model_selection import train_test_split
            from sklearn.preprocessing import StandardScaler
            print("Loading Iris dataset...")
            iris = load_iris()
            x_train, x_test, y_train, y_test = train_test_split(iris.data, iris.target, test_size=0.2, random_state=42)
            scaler = StandardScaler()
            x_train = scaler.fit_transform(x_train)
            x_test = scaler.transform(x_test)
            
            if not use_ensemble:
                model = tf.keras.models.Sequential([
                    tf.keras.layers.Dense(32, activation='relu', input_shape=(x_train.shape[1],)),
                    tf.keras.layers.Dense(16, activation='relu'),
                    tf.keras.layers.Dense(3, activation='softmax')
                ])
        elif dataset_id == 'wine':
            from sklearn.datasets import load_wine
            from sklearn.model_selection import train_test_split
            from sklearn.preprocessing import StandardScaler
            print("Loading Wine dataset...")
            wine = load_wine()
            x_train, x_test, y_train, y_test = train_test_split(wine.data, wine.target, test_size=0.2, random_state=42)
            scaler = StandardScaler()
            x_train = scaler.fit_transform(x_train)
            x_test = scaler.transform(x_test)
            
            if not use_ensemble:
                model = tf.keras.models.Sequential([
                    tf.keras.layers.Dense(32, activation='relu', input_shape=(x_train.shape[1],)),
                    tf.keras.layers.Dense(16, activation='relu'),
                    tf.keras.layers.Dense(3, activation='softmax')
                ])
        elif dataset_id == 'breast_cancer':
            from sklearn.datasets import load_breast_cancer
            from sklearn.model_selection import train_test_split
            from sklearn.preprocessing import StandardScaler
            print("Loading Breast Cancer dataset...")
            bc = load_breast_cancer()
            x_train, x_test, y_train, y_test = train_test_split(bc.data, bc.target, test_size=0.2, random_state=42)
            scaler = StandardScaler()
            x_train = scaler.fit_transform(x_train)
            x_test = scaler.transform(x_test)
            
            if not use_ensemble:
                model = tf.keras.models.Sequential([
                    tf.keras.layers.Dense(64, activation='relu', input_shape=(x_train.shape[1],)),
                    tf.keras.layers.Dense(32, activation='relu'),
                    tf.keras.layers.Dense(1, activation='sigmoid')
                ])
        elif dataset_id == 'digits':
            from sklearn.datasets import load_digits
            from sklearn.model_selection import train_test_split
            from sklearn.preprocessing import StandardScaler
            print("Loading Digits dataset...")
            digits = load_digits()
            x_train, x_test, y_train, y_test = train_test_split(digits.data, digits.target, test_size=0.2, random_state=42)
            scaler = StandardScaler()
            x_train = scaler.fit_transform(x_train)
            x_test = scaler.transform(x_test)
            
            if not use_ensemble:
                model = tf.keras.models.Sequential([
                    tf.keras.layers.Dense(64, activation='relu', input_shape=(x_train.shape[1],)),
                    tf.keras.layers.Dense(32, activation='relu'),
                    tf.keras.layers.Dense(10, activation='softmax')
                ])
        else:
            print(f"Invalid dataset_id: {dataset_id}")
            sys.exit(1)

        # Only compile if not using ensemble models
        if not use_ensemble:
            model.compile(optimizer='adam',
                          loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True) if dataset_id in ['dataset-1', 'dataset-2', 'dataset-4', 'dataset-13', 'iris', 'wine', 'breast_cancer', 'digits'] else 'mse',
                          metrics=['accuracy'] if dataset_id in ['dataset-1', 'dataset-2', 'dataset-4', 'dataset-13', 'iris', 'wine', 'breast_cancer', 'digits'] else ['mae'])

        # Handle ensemble models differently
        if use_ensemble:
            # Ensure we're using a compatible dataset
            if dataset_id not in ['dataset-9', 'dataset-13', 'iris', 'wine', 'breast_cancer', 'digits']:
                raise ValueError(f"Ensemble models can only be used with tabular datasets, not {dataset_id}")
            
            import pickle
            from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, GradientBoostingRegressor, GradientBoostingClassifier
            from sklearn.metrics import mean_absolute_error, accuracy_score
            
            print(f"Training {model_architecture} ensemble model on {dataset_id}...")
            
            # Flatten y if needed
            if len(y_train.shape) > 1 and y_train.shape[1] == 1:
                y_train = y_train.ravel()
            if len(y_test.shape) > 1 and y_test.shape[1] == 1:
                y_test = y_test.ravel()
            
            # Determine if classification or regression
            is_classification = dataset_id in ['dataset-13', 'iris', 'wine', 'breast_cancer', 'digits']
            
            # Create ensemble model (case-insensitive matching)
            arch_lower = model_architecture.lower() if model_architecture else ''
            if 'random' in arch_lower and 'forest' in arch_lower:
                if is_classification:
                    model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
                else:
                    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
            elif 'gradient' in arch_lower and 'boosting' in arch_lower:
                if is_classification:
                    model = GradientBoostingClassifier(n_estimators=100, random_state=42)
                else:
                    model = GradientBoostingRegressor(n_estimators=100, random_state=42)
            elif 'xgboost' in arch_lower or 'xgb' in arch_lower:
                try:
                    import xgboost as xgb
                    if is_classification:
                        model = xgb.XGBClassifier(n_estimators=100, random_state=42, n_jobs=-1)
                    else:
                        model = xgb.XGBRegressor(n_estimators=100, random_state=42, n_jobs=-1)
                except ImportError:
                    print("XGBoost not available, using Random Forest instead")
                    if is_classification:
                        model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
                    else:
                        model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
            elif 'lightgbm' in arch_lower or 'lgb' in arch_lower:
                try:
                    import lightgbm as lgb
                    if is_classification:
                        model = lgb.LGBMClassifier(n_estimators=100, random_state=42, n_jobs=-1, verbose=-1)
                    else:
                        model = lgb.LGBMRegressor(n_estimators=100, random_state=42, n_jobs=-1, verbose=-1)
                except ImportError:
                    print("LightGBM not available, using Random Forest instead")
                    if is_classification:
                        model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
                    else:
                        model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
            else:
                # Default to Random Forest
                print(f"Unknown ensemble architecture '{model_architecture}', defaulting to Random Forest")
                if is_classification:
                    model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
                else:
                    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
            
            # Train ensemble model
            update_session(session_id, 'running', progress=50, db=db)
            model.fit(x_train, y_train)
            update_session(session_id, 'running', progress=100, db=db)
            
            # Evaluate
            y_pred = model.predict(x_test)
            if is_classification:
                final_accuracy = accuracy_score(y_test, y_pred)
                final_mae = None
                final_loss = 1.0 - final_accuracy  # Loss as error rate
                metric_name = 'Accuracy'
            else:
                final_mae = mean_absolute_error(y_test, y_pred)
                final_accuracy = None
                final_loss = final_mae
                metric_name = 'MAE'
                y_mean = np.mean(y_train)
            
            # Save ensemble model using pickle
            session = db.trainingsessions.find_one({'_id': ObjectId(session_id)})
            model_id = session['modelId']
            save_path = os.path.join(SAVED_MODELS_DIR, f"{model_id}.pkl")
            with open(save_path, 'wb') as f:
                pickle.dump(model, f)
            print(f"Ensemble model saved to {save_path}")
            
            # Calculate percentages
            if is_classification:
                final_acc_pct = final_accuracy * 100
                final_loss_pct = final_loss * 100
            else:
                final_acc_pct = max(0, 100 * (1 - final_mae / y_mean)) if y_mean != 0 else 0
                final_loss_pct = (final_loss / y_mean * 100) if y_mean != 0 else 0
        
        else:
            # Neural network training (existing code)
            metric_name = 'Accuracy' if dataset_id in ['dataset-1', 'dataset-2', 'dataset-4', 'dataset-13', 'iris', 'wine', 'breast_cancer', 'digits'] else 'MAE'
            y_mean = np.mean(y_train) if dataset_id not in ['dataset-1', 'dataset-2', 'dataset-4', 'dataset-13', 'iris', 'wine', 'breast_cancer', 'digits'] else 1.0
            initial_loss = [None] # Use list to make it mutable in callback

            epochs = params.get('epochs', 5)
            
            # Create a custom callback to update progress
            class ProgressCallback(tf.keras.callbacks.Callback):
                def on_epoch_end(self, epoch, logs=None):
                    current_loss = logs.get('loss')
                    
                    if initial_loss[0] is None:
                        initial_loss[0] = current_loss
                    
                    # Extract appropriate metric based on dataset type
                    if dataset_id in ['dataset-1', 'dataset-2', 'dataset-4', 'dataset-13', 'iris', 'wine', 'breast_cancer', 'digits']:  # Classification
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
                # For classification (dataset-1,2,4,13), second value is accuracy
                # For regression (dataset-9), second value is mae
                if len(final_metrics) > 1:
                    if dataset_id in ['dataset-1', 'dataset-2', 'dataset-4', 'dataset-13']:
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
            
            # Save neural network model
            session = db.trainingsessions.find_one({'_id': ObjectId(session_id)})
            model_id = session['modelId']
            save_path = os.path.join(SAVED_MODELS_DIR, f"{model_id}.h5")
            model.save(save_path)
            print(f"Model saved to {save_path}")
            
            # Calculate percentages for neural networks
            if dataset_id in ['dataset-1', 'dataset-2', 'dataset-4', 'dataset-13', 'iris', 'wine', 'breast_cancer', 'digits']:
                final_acc_pct = final_accuracy * 100 if final_accuracy else 0
                final_loss_pct = (final_loss / initial_loss[0] * 100) if initial_loss[0] and initial_loss[0] != 0 else 0
            else:
                final_acc_pct = max(0, 100 * (1 - final_mae / y_mean)) if final_mae and y_mean != 0 else 0
                final_loss_pct = (final_loss / initial_loss[0] * 100) if initial_loss[0] and initial_loss[0] != 0 else 0
        
        # Ensure saved models directory exists
        if not os.path.exists(SAVED_MODELS_DIR):
            os.makedirs(SAVED_MODELS_DIR)

        # Update session with final metrics (already calculated above)
        # Determine metric name for final update
        if use_ensemble:
            final_metric_name = metric_name
        else:
            final_metric_name = 'Accuracy' if dataset_id in ['dataset-1', 'dataset-2', 'dataset-4', 'dataset-13', 'iris', 'wine', 'breast_cancer', 'digits'] else 'MAE'
        
        # Use appropriate metric value based on dataset type
        metric_value = final_accuracy if final_accuracy is not None else final_mae
        
        # Use epochs from params for neural networks, 1 for ensemble (no epochs)
        total_epochs = params.get('epochs', 5) if not use_ensemble else 1

        print(f"Final metrics: accuracy={metric_value}, loss={final_loss}, accuracy_percent={final_acc_pct}, loss_percent={final_loss_pct}")
        
        update_session(session_id, 'completed', progress=100, total_epochs=total_epochs, current_epoch=total_epochs, accuracy=metric_value, loss=final_loss, metric_name=final_metric_name, accuracy_percent=final_acc_pct, loss_percent=final_loss_pct, db=db)

    except Exception as e:
        import traceback
        print(f"Training failed: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        update_session(session_id, 'failed', db=db)
    finally:
        client.close()

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python train_model.py <session_id> <dataset_id> <params_json>")
        sys.exit(1)
    
    train(sys.argv[1], sys.argv[2], sys.argv[3])
