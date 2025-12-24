import sys
import json
import numpy as np
import gym
from stable_baselines3 import DQN, PPO, A2C, SAC, TD3
from stable_baselines3.common.env_util import make_vec_env
import torch

def train_model(parameters):
    """
    Train the RL model with the given parameters using Stable-Baselines3
    """
    # Extract parameters
    algorithm = parameters.get('architecture', 'DQN')
    total_timesteps = parameters.get('timesteps', 10000)  # Use timesteps instead of epochs for RL
    learning_rate = parameters.get('learningRate', 0.001)
    env_name = parameters.get('environment', 'CartPole-v1')  # Default environment
    
    print(f"Creating {algorithm} model with parameters: environment={env_name}, timesteps={total_timesteps}, learning_rate={learning_rate}")
    
    # Create environment
    # For demonstration, we'll use a standard gym environment
    # In a real scenario, this would be customized based on requirements
    try:
        env = make_vec_env(env_name, n_envs=1)
    except:
        # If the specified environment doesn't exist, default to CartPole
        print(f"Environment {env_name} not found, using CartPole-v1")
        env = make_vec_env('CartPole-v1', n_envs=1)
    
    # Select the appropriate algorithm
    if algorithm == 'DQN':
        model = DQN('MlpPolicy', env, learning_rate=learning_rate, verbose=1)
    elif algorithm == 'PPO':
        model = PPO('MlpPolicy', env, learning_rate=learning_rate, verbose=1)
    elif algorithm == 'A2C':
        model = A2C('MlpPolicy', env, learning_rate=learning_rate, verbose=1)
    elif algorithm == 'SAC':
        model = SAC('MlpPolicy', env, learning_rate=learning_rate, verbose=1)
    elif algorithm == 'TD3':
        model = TD3('MlpPolicy', env, learning_rate=learning_rate, verbose=1)
    else:
        # Default to DQN if algorithm not recognized
        print(f"Algorithm {algorithm} not recognized, defaulting to DQN")
        model = DQN('MlpPolicy', env, learning_rate=learning_rate, verbose=1)
    
    print(f"{algorithm} model created successfully")
    
    print("Starting training...")
    
    # Training with progress reporting
    # For Stable-Baselines3, we'll report progress in chunks
    chunk_size = max(1000, total_timesteps // 100)  # Update progress every 1% or every 1000 steps, whichever is larger
    
    for step in range(0, total_timesteps, chunk_size):
        current_timesteps = min(chunk_size, total_timesteps - step)
        
        # Report progress (0-100%)
        progress = int((step / total_timesteps) * 100)
        print(f"PROGRESS:{progress}")
        sys.stdout.flush()
        
        # Train for the current chunk
        model.learn(total_timesteps=current_timesteps, reset_num_timesteps=False)
    
    # Report final progress
    progress = int((total_timesteps / total_timesteps) * 100)
    print(f"PROGRESS:{progress}")
    sys.stdout.flush()
    
    print("Training completed successfully")
    
    # Save the model
    model.save('trained_rl_model.zip')
    print("Model saved as 'trained_rl_model.zip'")

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
            'inputSize': 4,
            'hiddenSize': 64,
            'outputSize': 2,
            'timesteps': 10000,  # Use timesteps instead of epochs for RL
            'learningRate': 0.001,
            'batchSize': 32,
            'architecture': 'DQN',
            'environment': 'CartPole-v1'
        }
        train_model(default_params)