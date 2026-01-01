# Epoch-ml Documentation

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Frontend Components](#frontend-components)
- [Machine Learning Models](#machine-learning-models)
- [Security](#security)
- [Deployment](#deployment)

## Overview

Epoch-ml is an interactive machine learning platform that enables users to train various AI models with customizable parameters through an intuitive interface. The platform supports multiple model architectures and provides transparent resource allocation based on computational requirements.

## Architecture

The application follows a modern full-stack architecture:

- **Frontend**: Next.js with React and Chakra UI
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Machine Learning**: Python with TensorFlow

### Backend Structure

```
backend/
├── controllers/   # Request handlers
├── middleware/    # Authentication, validation, security
├── models/        # Database schemas
├── routes/        # API route definitions
└── utils/         # Utility functions
```

### Frontend Structure

```
frontend/
├── components/    # Reusable React components
├── pages/         # Next.js pages
├── public/        # Static assets
└── src/           # Source files
```

### ML Models Structure

```
models/
├── rnn/          # RNN implementations
├── cnn/          # CNN implementations
└── base_model.py # Base model interface
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - Logout user

### Models

- `GET /api/models` - Get all available models
- `GET /api/models/:id` - Get a specific model
- `POST /api/models` - Create a new model (admin only)
- `GET /api/models/:id/export` - Export/download a trained model

### Training

- `POST /api/training/start` - Start a new training session
- `GET /api/training/:id` - Get a specific training session
- `GET /api/training` - Get all training sessions for user

### Users

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/training-history` - Get user's training history
- `GET /api/users` - Get all users (admin only)

### Resources

- `GET /api/resources/credits` - Get user's credits
- `POST /api/resources/add-credits` - Add credits to user account
- `GET /api/resources/pricing` - Get pricing information

## Frontend Components

### Main Pages

- `index.js` - Home page
- `login.js` - Login page
- `register.js` - Registration page
- `dashboard.js` - User dashboard
- `models.js` - Available models page
- `train.js` - Model training page
- `training-history.js` - Training history page

### Reusable Components

- `Navbar.js` - Navigation bar
- `CreditManager.js` - Credit management UI
- `TrainingVisualization.js` - Training progress visualization
- `ModelExporter.js` - Model export functionality

## Machine Learning Models

The platform supports multiple model architectures:

### RNN (Recurrent Neural Networks)

Located in `models/rnn/`, RNN models are ideal for sequence prediction tasks. The implementation uses TensorFlow with configurable parameters like hidden size, learning rate, and number of layers.

### CNN (Convolutional Neural Networks)

Located in `models/cnn/`, CNN models are designed for image processing tasks. The implementation includes configurable filters, kernel sizes, and dense layers.


### Base Model Interface

The `models/base_model.py` file defines a standard interface that all models must implement, ensuring consistency across different model types.

## Security

The application implements several security measures:

- **Authentication**: JWT-based authentication for all protected routes
- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: Protection against excessive requests
- **Security Headers**: Helmet.js for setting security headers
- **NoSQL Injection Prevention**: express-mongo-sanitize
- **XSS Prevention**: xss-clean for sanitizing user inputs

## Deployment

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Running the Application

1. Install dependencies:
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

2. Start the application:
   ```bash
   npm start
   ```

For development:

```bash
npm run dev
```

### Docker Deployment (Optional)

A Dockerfile can be added for containerized deployment:

```dockerfile
# Backend
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

For frontend deployment, build the Next.js application:

```bash
npm run build
npm run start
```
