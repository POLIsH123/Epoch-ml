# Contributing to Epoch-ml

Thank you for your interest in contributing to Epoch-ml! We welcome contributions from the community to help improve our machine learning training platform.

## Table of Contents
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Submitting Changes](#submitting-changes)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Testing](#testing)
- [Community Guidelines](#community-guidelines)

## Getting Started

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes
4. Submit a pull request

## Development Setup

1. Clone your forked repository:
   ```bash
   git clone https://github.com/your-username/epoch-ml.git
   cd epoch-ml
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. Set up environment variables by creating a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Code Style

- Follow the existing code style in the project
- Use meaningful variable and function names
- Write clear, concise comments
- Document public functions and classes
- Keep functions focused and small

### JavaScript/Node.js
- Use camelCase for variables and functions
- Use PascalCase for classes and constructors
- Use UPPERCASE for constants
- Use 2 spaces for indentation
- Use semicolons at the end of statements

### Python
- Use snake_case for variables and functions
- Use PascalCase for classes
- Use UPPERCASE for constants
- Use 4 spaces for indentation
- Follow PEP 8 style guide

## Submitting Changes

1. Ensure your code follows the style guidelines
2. Test your changes thoroughly
3. Update documentation as needed
4. Create a pull request with a clear title and description
5. Link any relevant issues in your pull request description

## Project Structure

```
epoch-ml/
├── backend/           # Server-side code
│   ├── controllers/   # Request handlers
│   ├── middleware/    # Authentication, validation, etc.
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   └── utils/         # Utility functions
├── frontend/          # Client-side code
│   ├── components/    # React components
│   ├── pages/         # Next.js pages
│   ├── public/        # Static assets
│   └── src/           # Source files
├── models/            # Machine learning models
│   ├── rnn/          # RNN implementations
│   ├── cnn/          # CNN implementations
└── README.md
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Frontend**: React, Next.js, Chakra UI
- **Machine Learning**: TensorFlow.js, Python
- **Authentication**: JWT
- **Styling**: CSS, Chakra UI

## Testing

- Write unit tests for new functionality
- Run existing tests to ensure they still pass
- Test the UI components interactively

## Community Guidelines

- Be respectful and inclusive
- Provide constructive feedback
- Follow the code of conduct
- Help others in the community

Thank you for contributing to Epoch-ml!
