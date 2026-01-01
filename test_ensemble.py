"""
Quick test script to verify ensemble models work
"""
import sys
sys.path.insert(0, 'models')

from base_model import ModelFactory
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

print("Testing Ensemble Models...")

# Load data
print("\n1. Loading Iris dataset...")
iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(iris.data, iris.target, test_size=0.2, random_state=42)
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)
print(f"   Training samples: {X_train.shape[0]}, Features: {X_train.shape[1]}")

# Test Random Forest
print("\n2. Testing Random Forest...")
config = {
    'model_type': 'random_forest',
    'task_type': 'classification',
    'n_estimators': 10,
    'random_state': 42
}
try:
    model = ModelFactory.create_model('RANDOM_FOREST', config)
    print("   ✓ Model created successfully")
    
    model.build_model()
    print("   ✓ Model built successfully")
    
    history = model.train(X_train, y_train, X_test, y_test)
    print(f"   ✓ Training completed")
    print(f"   Train Accuracy: {history['train_accuracy'][0]:.4f}")
    print(f"   Val Accuracy: {history['val_accuracy'][0]:.4f}")
    
    predictions = model.predict(X_test)
    print(f"   ✓ Predictions made: {len(predictions)} samples")
    
except Exception as e:
    print(f"   ✗ Error: {e}")
    import traceback
    traceback.print_exc()

# Test Gradient Boosting
print("\n3. Testing Gradient Boosting...")
config = {
    'model_type': 'gradient_boosting',
    'task_type': 'classification',
    'n_estimators': 10,
    'random_state': 42
}
try:
    model = ModelFactory.create_model('GRADIENT_BOOSTING', config)
    print("   ✓ Model created successfully")
    
    model.build_model()
    print("   ✓ Model built successfully")
    
    history = model.train(X_train, y_train, X_test, y_test)
    print(f"   ✓ Training completed")
    print(f"   Train Accuracy: {history['train_accuracy'][0]:.4f}")
    print(f"   Val Accuracy: {history['val_accuracy'][0]:.4f}")
    
except Exception as e:
    print(f"   ✗ Error: {e}")
    import traceback
    traceback.print_exc()

# Test with "Random Forest" (space, not underscore)
print("\n4. Testing with 'Random Forest' (space)...")
try:
    model = ModelFactory.create_model('Random Forest', config)
    print("   ✓ Model created with space in name")
except Exception as e:
    print(f"   ✗ Error: {e}")

print("\n✓ All tests completed!")
