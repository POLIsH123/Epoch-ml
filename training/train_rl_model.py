import sys
import os
import json
import time
import pymongo
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime

# Suppress TensorFlow noise if it's imported somewhere
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

# Config
MONGO_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/epoch-ml')
SAVED_MODELS_DIR = 'models/saved'

def update_session(session_id, status, progress=None, reward=None, episodes=None, accuracy=None, loss=None, metric_name=None, accuracy_percent=None, loss_percent=None, current_epoch=None, total_epochs=None, db=None):
    close_at_end = False
    if db is None:
        client = MongoClient(MONGO_URI)
        db = client.get_default_database()
        close_at_end = True

    update_data = {'status': status}
    if progress is not None:
        update_data['progress'] = progress
    if reward is not None:
        update_data['reward'] = reward
    if episodes is not None:
        update_data['episodes'] = episodes
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

def train_rl_model(session_id, environment_name, params_json):
    params = json.loads(params_json)
    client = MongoClient(MONGO_URI)
    db = client.get_default_database()

    print(f"Starting RL training for session {session_id} in environment {environment_name}")

    update_session(session_id, 'running', db=db)

    try:
        # Import RL dependencies
        import gym
        from stable_baselines3 import DQN, PPO, A2C, SAC, TD3
        from stable_baselines3.common.env_util import make_vec_env
        import numpy as np

        # Extract parameters
        algorithm = params.get('architecture', 'DQN')
        total_timesteps = params.get('timesteps', 10000)
        learning_rate = params.get('learningRate', 0.001)

        print(f"Training {algorithm} in {environment_name} for {total_timesteps} timesteps")

        # Create environment
        try:
            env = make_vec_env(environment_name, n_envs=1)
        except:
            print(f"Environment {environment_name} not found, using CartPole-v1")
            env = make_vec_env('CartPole-v1', n_envs=1)
            environment_name = 'CartPole-v1'

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
            print(f"Algorithm {algorithm} not recognized, defaulting to DQN")
            model = DQN('MlpPolicy', env, learning_rate=learning_rate, verbose=1)

        print(f"{algorithm} model created successfully for {environment_name}")

        # Training with progress reporting
        chunk_size = max(1000, total_timesteps // 100)  # Update progress every 1% or every 1000 steps

        for step in range(0, total_timesteps, chunk_size):
            current_timesteps = min(chunk_size, total_timesteps - step)

            # Report progress (0-100%)
            progress = int((step / total_timesteps) * 100)
            print(f"PROGRESS:{progress}")
            sys.stdout.flush()

            # Update progress in database
            update_session(session_id, 'running', progress=progress, db=db)

            # Train for the current chunk
            model.learn(total_timesteps=current_timesteps, reset_num_timesteps=False)

        # Report final progress
        progress = int((total_timesteps / total_timesteps) * 100)
        print(f"PROGRESS:{progress}")
        sys.stdout.flush()

        print("RL Training completed successfully")

        # Evaluate the model
        print("Evaluating model...")
        eval_env = make_vec_env(environment_name, n_envs=1)

        # Run a few evaluation episodes
        episode_rewards = []
        for _ in range(10):
            try:
                obs = eval_env.reset()
                episode_reward = 0
                done = False
                # Handle the new gym API where reset() returns (obs, info)
                if isinstance(obs, tuple) and len(obs) == 2:
                    obs, info = obs
                
                while not done:
                    action, _ = model.predict(obs, deterministic=True)
                    step_result = eval_env.step(action)
                    
                    # Handle the new gym API where step() returns (obs, reward, terminated, truncated, info)
                    if len(step_result) == 5:  # New gym API
                        obs, reward, terminated, truncated, info = step_result
                        done = terminated or truncated
                    else:  # Old gym API
                        obs, reward, done, info = step_result
                        
                    episode_reward += reward
                episode_rewards.append(episode_reward)
            except Exception as e:
                print(f"Evaluation episode failed: {e}")
                # If evaluation fails, just continue with the next episode
                continue

        if episode_rewards:
            avg_reward = np.mean(episode_rewards)
            print(f"Average reward over {len(episode_rewards)} episodes: {avg_reward}")
        else:
            avg_reward = 0
            print("No successful evaluation episodes")

        # Save model
        if not os.path.exists(SAVED_MODELS_DIR):
            os.makedirs(SAVED_MODELS_DIR)

        session = db.trainingsessions.find_one({'_id': ObjectId(session_id)})
        model_id = session['modelId']

        save_path = os.path.join(SAVED_MODELS_DIR, f"{model_id}_rl.zip")
        model.save(save_path)
        print(f"RL Model saved to {save_path}")

        # Update session with final metrics
        update_session(session_id, 'completed', progress=100, reward=avg_reward, episodes=10, accuracy=avg_reward, metricName='Reward', accuracyPercent=avg_reward*10, currentEpoch=10, totalEpochs=10, db=db)

    except Exception as e:
        print(f"RL Training failed: {e}")
        update_session(session_id, 'failed', db=db)
    finally:
        client.close()

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python train_rl_model.py <session_id> <environment_name> <params_json>")
        sys.exit(1)

    train_rl_model(sys.argv[1], sys.argv[2], sys.argv[3])
