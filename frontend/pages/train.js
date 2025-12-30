import { Box, Heading, Text, Button, VStack, Container, Card, CardHeader, CardBody, Grid, FormControl, FormLabel, Select, Input, useColorModeValue, useToast, Flex, Icon, Spinner, Textarea } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiZap, FiDatabase, FiCpu, FiBarChart2, FiDollarSign, FiTarget } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

export default function TrainModel() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [formData, setFormData] = useState({
    modelId: '',
    datasetId: '',
    targetColumn: '',
    parameters: {
      epochs: 10,
      batchSize: 32,
      learningRate: 0.001,
      timesteps: 1000,
      environment: 'CartPole-v1'
    }
  });
  const [columns, setColumns] = useState([]);
  const [trainingCost, setTrainingCost] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch user profile, models, datasets, and training sessions
    Promise.all([
      fetch('http://localhost:5001/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch('http://localhost:5001/api/models', {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch('http://localhost:5001/api/resources/datasets', {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch('http://localhost:5001/api/training', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ])
      .then(async ([profileRes, modelsRes, datasetsRes, trainingRes]) => {
        if (profileRes.status === 401 || modelsRes.status === 401 || datasetsRes.status === 401 || trainingRes.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        const userData = await profileRes.json();
        const modelData = await modelsRes.json();
        const datasetData = await datasetsRes.json();
        const trainingData = await trainingRes.json();

        setUser(userData);
        // Filter out GPT/BERT models and RL models
        const filteredModels = modelData.filter(model =>
          !['GPT-2', 'GPT-3', 'GPT-3.5', 'GPT-4', 'BERT', 'T5', 'DQN', 'A2C', 'PPO', 'SAC', 'DDPG', 'TD3'].includes(model.type)
        );
        setModels(filteredModels);
        setDatasets(datasetData);
        
        // Check if user has any active training sessions
        const activeSession = Array.isArray(trainingData) ? 
          trainingData.some(session => session.status === 'running' || session.status === 'queued') : false;
        
        if (activeSession) {
          toast({
            title: 'Training already in progress',
            description: 'You already have an active training session. Please wait for it to complete before starting another.',
            status: 'warning',
            duration: 7000,
            isClosable: true,
          });
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        toast({
          title: 'Connection Error',
          description: 'Could not connect to the backend server.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
      });
  }, [router]);

  // Update columns when dataset changes
  useEffect(() => {
    if (formData.datasetId) {
      const selectedDataset = datasets.find(d => d.id === formData.datasetId);
      if (selectedDataset && selectedDataset.columns) {
        setColumns(selectedDataset.columns);
      } else {
        setColumns([]);
      }
    } else {
      setColumns([]);
    }
  }, [formData.datasetId, datasets]);

  // Update training cost when model type changes
  useEffect(() => {
    if (formData.modelId) {
      const selectedModel = models.find(m => m._id === formData.modelId);
      if (selectedModel) {
        let cost = 10; // Base cost
        switch (selectedModel.type) {
          case 'ResNet':
          case 'Inception':
            cost = 30;
            break;
          case 'VGG':
            cost = 20;
            break;
          case 'LSTM':
          case 'GRU':
          case 'CNN':
          case 'RNN':
          case 'Random Forest':
          case 'Gradient Boosting':
          case 'XGBoost':
          case 'LightGBM':
            cost = 10;
            break;
          default:
            cost = 10;
        }

        // Dynamic cost based on epochs
        const epochs = formData.parameters.epochs || 5;
        const epochMultiplier = Math.max(1, epochs / 5);
        const dynamicCost = Math.round(cost * epochMultiplier);

        setTrainingCost(dynamicCost);
      }
    }
  }, [formData.modelId, formData.parameters.epochs, models]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.modelId || !formData.datasetId) {
      toast({
        title: 'Missing required fields',
        description: 'Please select both a model and a dataset',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (user.credits < trainingCost) {
      toast({
        title: 'Insufficient credits',
        description: `You need ${trainingCost} credits to train this model, but you only have ${user.credits}.`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/training/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          modelId: formData.modelId,
          datasetId: formData.datasetId,
          targetColumn: formData.targetColumn,
          parameters: formData.parameters
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Training started',
          description: `Your ${models.find(m => m._id === formData.modelId)?.name} model is now training!`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Update user credits
        setUser(prev => ({ ...prev, credits: data.creditsRemaining }));

        // Reset form
        setFormData({
          modelId: '',
          datasetId: '',
          targetColumn: '',
          parameters: {
            epochs: 10,
            batchSize: 32,
            learningRate: 0.001,
            timesteps: 1000,
            systemPrompt: 'You are a helpful assistant.',
            environment: 'CartPole-v1'
          }
        });
      } else {
        // Check if the error is due to active training session
        if (data.error && data.error.includes('already have an active training session')) {
          toast({
            title: 'Training already in progress',
            description: data.error,
            status: 'warning',
            duration: 7000,
            isClosable: true,
          });
        } else {
          toast({
            title: 'Training failed',
            description: data.error || 'Could not start training',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }
    } catch (err) {
      toast({
        title: 'Network error',
        description: 'Please check your connection and try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={bg}>
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg={bg}>
      <Sidebar user={user} />
      <Box ml="250px" p={6}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Flex justify="space-between" align="center">
              <VStack align="start" spacing={2}>
                <Heading as="h1" size="lg">Train Architecture</Heading>
                <Text color="gray.500">Initialize new neural processing sessions</Text>
              </VStack>
              <Flex align="center" gap={4}>
                <Box p={3} className="glass" px={6}>
                  <Flex align="center" gap={2}>
                    <Icon as={FiDollarSign} color="teal.400" />
                    <Text fontWeight="bold" color="teal.400">{(user?.credits || 0).toLocaleString()} Credits</Text>
                  </Flex>
                </Box>
              </Flex>
            </Flex>
          </motion.div>

          {/* Training Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Box className="glass" p={8}>
              <form onSubmit={handleSubmit}>
                <VStack spacing={8} align="stretch">
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={8}>
                    <FormControl id="modelId" isRequired>
                      <FormLabel fontWeight="bold" color="teal.400">Target Architecture</FormLabel>
                      <Select
                        value={formData.modelId}
                        onChange={(e) => handleInputChange('modelId', e.target.value)}
                        placeholder="Choose a model..."
                        bg="rgba(0,0,0,0.1)"
                      >
                        {models.map(model => (
                          <option key={model._id} value={model._id}>
                            {model.name} ({model.type})
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl id="datasetId" isRequired>
                      <FormLabel fontWeight="bold" color="teal.400">Payload Source</FormLabel>
                      <Select
                        value={formData.datasetId}
                        onChange={(e) => handleInputChange('datasetId', e.target.value)}
                        placeholder="Select a dataset..."
                        bg="rgba(0,0,0,0.1)"
                      >
                        {datasets.map(dataset => (
                          <option key={dataset.id} value={dataset.id}>
                            {dataset.name} ({dataset.size})
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl id="targetColumn">
                      <FormLabel fontWeight="bold" color="teal.400">Prediction Target</FormLabel>
                      <Select
                        value={formData.targetColumn}
                        onChange={(e) => handleInputChange('targetColumn', e.target.value)}
                        placeholder="Select target..."
                        bg="rgba(0,0,0,0.1)"
                      >
                        {columns.map(column => (
                          <option key={column} value={column}>
                            {column}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl id="trainingCost">
                      <FormLabel fontWeight="bold" color="teal.400">Resource Estimation</FormLabel>
                      <Input
                        value={`${trainingCost} Credits Required`}
                        isDisabled
                        bg="rgba(0,0,0,0.1)"
                        color="teal.200"
                        fontWeight="bold"
                      />
                    </FormControl>
                  </Grid>

                  {/* Parameters based on model type */}
                  {formData.modelId && (
                    <Box mt={6}>
                      <Heading as="h4" size="md" mb={6} color="teal.300">Hyperparameters</Heading>
                      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
                        <FormControl id="epochs">
                          <FormLabel>Optimization Epochs</FormLabel>
                          <Input
                            type="number"
                            value={formData.parameters.epochs}
                            onChange={(e) => handleInputChange('parameters.epochs', parseInt(e.target.value))}
                            bg="rgba(0,0,0,0.1)"
                          />
                        </FormControl>

                        <FormControl id="batchSize">
                          <FormLabel>Inference Batch Size</FormLabel>
                          <Input
                            type="number"
                            value={formData.parameters.batchSize}
                            onChange={(e) => handleInputChange('parameters.batchSize', parseInt(e.target.value))}
                            bg="rgba(0,0,0,0.1)"
                          />
                        </FormControl>

                        <FormControl id="learningRate">
                          <FormLabel>Learning Rate</FormLabel>
                          <Input
                            type="number"
                            step="0.0001"
                            value={formData.parameters.learningRate}
                            onChange={(e) => handleInputChange('parameters.learningRate', parseFloat(e.target.value))}
                            bg="rgba(0,0,0,0.1)"
                          />
                        </FormControl>
                      </Grid>
                    </Box>
                  )}

                  <Flex justify="flex-end" pt={4}>
                    <Button
                      type="submit"
                      size="lg"
                      leftIcon={<FiZap />}
                      isLoading={isLoading}
                      loadingText="Initializing Engine..."
                      px={12}
                      borderRadius="full"
                      bgGradient="linear(to-r, teal.400, blue.500)"
                      _hover={{ bgGradient: 'linear(to-r, teal.500, blue.600)', transform: 'translateY(-2px)' }}
                      boxShadow="0 4px 15px rgba(45, 212, 191, 0.3)"
                    >
                      Commence Training
                    </Button>
                  </Flex>
                </VStack>
              </form>
            </Box>
          </motion.div>

          {/* Model Information */}
          {formData.modelId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Box className="glass" p={6}>
                <Flex align="center" mb={4}>
                  <Icon as={FiCpu} w={6} h={6} color="blue.400" mr={3} />
                  <Heading as="h3" size="md">Architecture Details</Heading>
                </Flex>
                {(() => {
                  const model = models.find(m => m._id === formData.modelId);
                  if (!model) return null;
                  return (
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={8}>
                      <VStack align="start" spacing={3}>
                        <Text><strong>Classification:</strong> {model.name}</Text>
                        <Text><strong>Core Model:</strong> {model.type}</Text>
                        <Text><strong>Structural Layer:</strong> {model.architecture}</Text>
                      </VStack>
                      <VStack align="start" spacing={3}>
                        <Text><strong>Description:</strong> {model.description}</Text>
                        <Text><strong>Deployment Date:</strong> {new Date(model.createdAt).toLocaleDateString()}</Text>
                      </VStack>
                    </Grid>
                  );
                })()}
              </Box>
            </motion.div>
          )}
          
          {/* Code Export Section */}
          {formData.modelId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Box className="glass" p={6}>
                <Flex align="center" mb={4}>
                  <Icon as={FiBarChart2} w={6} h={6} color="teal.400" mr={3} />
                  <Heading as="h3" size="md">Export Model Code</Heading>
                </Flex>
                <VStack align="stretch" spacing={4}>
                  <Text color="gray.400">
                    Copy the exact code needed to recreate this model in your own environment:
                  </Text>
                  <Textarea
                    value={(() => {
                      const model = models.find(m => m._id === formData.modelId);
                      if (!model) return '';
                      
                      if (model.type === 'Custom' || model.type === 'Multi-Layer') {
                        // Generate code for custom model with layers
                        let code = `# ${model.name} - ${model.type} Model
# Generated by Epoch-ML

import tensorflow as tf
from tensorflow import keras

# Model Architecture
model = keras.Sequential([`;
                        
                        if (model.layers && model.layers.length > 0) {
                          model.layers.forEach(layer => {
                            switch(layer.type) {
                              case 'Dense':
                                code += `\n    keras.layers.Dense(${layer.config.units || 64}, activation='${layer.config.activation || 'relu'}'),`;
                                break;
                              case 'Conv2D':
                                code += `\n    keras.layers.Conv2D(${layer.config.filters || 32}, (${layer.config.kernelSize || 3}, ${layer.config.kernelSize || 3}), activation='${layer.config.activation || 'relu'}'),`;
                                break;
                              case 'LSTM':
                                code += `\n    keras.layers.LSTM(${layer.config.units || 50}, return_sequences=${layer.config.returnSequences || false}),`;
                                break;
                              case 'GRU':
                                code += `\n    keras.layers.GRU(${layer.config.units || 50}, return_sequences=${layer.config.returnSequences || false}),`;
                                break;
                              case 'Dropout':
                                code += `\n    keras.layers.Dropout(${layer.config.rate || 0.2}),`;
                                break;
                              case 'Flatten':
                                code += `\n    keras.layers.Flatten(),`;
                                break;
                              case 'MaxPooling2D':
                                code += `\n    keras.layers.MaxPooling2D((${layer.config.poolSize || 2}, ${layer.config.poolSize || 2})),`;
                                break;
                              default:
                                code += `\n    # Unsupported layer type: ${layer.type}`;
                            }
                          });
                        }
                        
                        code += `
])

# Compile Model
model.compile(
    optimizer='${formData.parameters.optimizer || 'adam'}',
    loss='${formData.parameters.loss || 'sparse_categorical_crossentropy'}',  # Adjust based on your task
    metrics=['accuracy']
)

# Training Configuration
EPOCHS = ${formData.parameters.epochs || 10}
BATCH_SIZE = ${formData.parameters.batchSize || 32}
LEARNING_RATE = ${formData.parameters.learningRate || 0.001}

# Load your data
# X_train, y_train = load_your_data()

# Train the model
# model.fit(X_train, y_train, epochs=EPOCHS, batch_size=BATCH_SIZE)`;
                        
                        return code;
                      } else {
                        // Generate code for standard models
                        return `# ${model.name} - ${model.type} Model
# Generated by Epoch-ML

import tensorflow as tf
from tensorflow import keras

# Model Architecture
model = keras.Sequential([
    keras.layers.Dense(64, activation='relu', input_shape=(input_dim,)),
    keras.layers.Dense(32, activation='relu'),
    keras.layers.Dense(1, activation='sigmoid')  # Adjust based on your task
])

# Compile Model
model.compile(
    optimizer='adam',
    loss='binary_crossentropy',  # Adjust based on your task
    metrics=['accuracy']
)

# Training Configuration
EPOCHS = ${formData.parameters.epochs || 10}
BATCH_SIZE = ${formData.parameters.batchSize || 32}
LEARNING_RATE = ${formData.parameters.learningRate || 0.001}

# Load your data
# X_train, y_train = load_your_data()

# Train the model
# model.fit(X_train, y_train, epochs=EPOCHS, batch_size=BATCH_SIZE)`;
                      }
                    })()}
                    rows={10}
                    fontFamily="monospace"
                    fontSize="sm"
                    bg="rgba(0,0,0,0.2)"
                    border="none"
                    readOnly
                  />
                  <Flex justify="flex-end">
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          (() => {
                            const model = models.find(m => m._id === formData.modelId);
                            if (!model) return '';
                            
                            if (model.type === 'Custom' || model.type === 'Multi-Layer') {
                              // Generate code for custom model with layers
                              let code = `# ${model.name} - ${model.type} Model
# Generated by Epoch-ML

import tensorflow as tf
from tensorflow import keras

# Model Architecture
model = keras.Sequential([`;
                              
                              if (model.layers && model.layers.length > 0) {
                                model.layers.forEach(layer => {
                                  switch(layer.type) {
                                    case 'Dense':
                                      code += `\n    keras.layers.Dense(${layer.config.units || 64}, activation='${layer.config.activation || 'relu'}'),`;
                                      break;
                                    case 'Conv2D':
                                      code += `\n    keras.layers.Conv2D(${layer.config.filters || 32}, (${layer.config.kernelSize || 3}, ${layer.config.kernelSize || 3}), activation='${layer.config.activation || 'relu'}'),`;
                                      break;
                                    case 'LSTM':
                                      code += `\n    keras.layers.LSTM(${layer.config.units || 50}, return_sequences=${layer.config.returnSequences || false}),`;
                                      break;
                                    case 'GRU':
                                      code += `\n    keras.layers.GRU(${layer.config.units || 50}, return_sequences=${layer.config.returnSequences || false}),`;
                                      break;
                                    case 'Dropout':
                                      code += `\n    keras.layers.Dropout(${layer.config.rate || 0.2}),`;
                                      break;
                                    case 'Flatten':
                                      code += `\n    keras.layers.Flatten(),`;
                                      break;
                                    case 'MaxPooling2D':
                                      code += `\n    keras.layers.MaxPooling2D((${layer.config.poolSize || 2}, ${layer.config.poolSize || 2})),`;
                                      break;
                                    default:
                                      code += `\n    # Unsupported layer type: ${layer.type}`;
                                  }
                                });
                              }
                              
                              code += `
])

# Compile Model
model.compile(
    optimizer='${formData.parameters.optimizer || 'adam'}',
    loss='${formData.parameters.loss || 'sparse_categorical_crossentropy'}',  # Adjust based on your task
    metrics=['accuracy']
)

# Training Configuration
EPOCHS = ${formData.parameters.epochs || 10}
BATCH_SIZE = ${formData.parameters.batchSize || 32}
LEARNING_RATE = ${formData.parameters.learningRate || 0.001}

# Load your data
# X_train, y_train = load_your_data()

# Train the model
# model.fit(X_train, y_train, epochs=EPOCHS, batch_size=BATCH_SIZE)`;
                              
                              return code;
                            } else {
                              // Generate code for standard models
                              return `# ${model.name} - ${model.type} Model
# Generated by Epoch-ML

import tensorflow as tf
from tensorflow import keras

# Model Architecture
model = keras.Sequential([
    keras.layers.Dense(64, activation='relu', input_shape=(input_dim,)),
    keras.layers.Dense(32, activation='relu'),
    keras.layers.Dense(1, activation='sigmoid')  # Adjust based on your task
])

# Compile Model
model.compile(
    optimizer='adam',
    loss='binary_crossentropy',  # Adjust based on your task
    metrics=['accuracy']
)

# Training Configuration
EPOCHS = ${formData.parameters.epochs || 10}
BATCH_SIZE = ${formData.parameters.batchSize || 32}
LEARNING_RATE = ${formData.parameters.learningRate || 0.001}

# Load your data
# X_train, y_train = load_your_data()

# Train the model
# model.fit(X_train, y_train, epochs=EPOCHS, batch_size=BATCH_SIZE)`;
                            }
                          })()
                        );
                        toast({
                          title: 'Code copied',
                          description: 'The model code has been copied to your clipboard',
                          status: 'success',
                          duration: 3000,
                          isClosable: true,
                        });
                      }}
                      colorScheme="teal"
                      size="sm"
                      leftIcon={<FiDatabase />}
                    >
                      Copy to Clipboard
                    </Button>
                  </Flex>
                </VStack>
              </Box>
            </motion.div>
          )}
        </VStack>
      </Box>
    </Box>
  );
}
