import { Box, Heading, Text, Button, VStack, Container, Select, FormControl, FormLabel, Input, Card, CardHeader, CardBody, Flex, Icon, useColorModeValue, useToast, Grid, GridItem, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiCpu, FiBarChart2, FiZap, FiDollarSign, FiDatabase, FiSliders, FiUpload, FiTarget, FiPlus } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

export default function TrainModel() {
  const [user, setUser] = useState(null);
  const [models, setModels] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [targetColumn, setTargetColumn] = useState('');
  const [showCreateModel, setShowCreateModel] = useState(false);
  const [newModel, setNewModel] = useState({
    name: '',
    type: '',
    description: ''
  });
  const [parameters, setParameters] = useState({
    learningRate: 0.001,
    epochs: 10,
    batchSize: 32,
    timesteps: 10000, // For RL models
    environment: 'CartPole-v1' // For RL models
  });
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
    
    // Verify token and get user profile
    fetch('http://localhost:5001/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (res.status === 401) {
        // Token is invalid, redirect to login
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      return res.json();
    })
    .then(userData => {
      if (userData) {
        setUser(userData);
        
        // Get available models and datasets
        return Promise.all([
          fetch('http://localhost:5001/api/models', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }),
          fetch('http://localhost:5001/api/resources/datasets', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        ]);
      }
    })
    .then(([modelsRes, datasetsRes]) => {
      return Promise.all([modelsRes.json(), datasetsRes.json()]);
    })
    .then(([modelsData, datasetsData]) => {
      setModels(Array.isArray(modelsData) ? modelsData : []);
      setDatasets(Array.isArray(datasetsData) ? datasetsData : []);
      setLoading(false);
    })
    .catch(err => {
      console.error('Error fetching data:', err);
      // Set empty arrays as fallback
      setModels([]);
      setDatasets([]);
      setLoading(false);
      toast({
        title: 'Error loading data',
        description: 'Could not load models or datasets. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      // Don't redirect to login here, just continue with empty data
    });
  }, [router]);
  
  const handleCreateModel = async () => {
    if (!newModel.name || !newModel.type) {
      toast({
        title: 'Model name and type required',
        description: 'Please enter a name and select a type for your model',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newModel)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Add the new model to the list
        setModels(prev => [...prev, data]);
        setSelectedModel(data._id);
        setNewModel({ name: '', type: '', description: '' });
        setShowCreateModel(false);
        
        toast({
          title: 'Model created',
          description: `Model "${newModel.name}" has been created successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error creating model',
          description: data.error || 'Could not create model',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: 'Network error',
        description: 'Please check your connection and try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const handleParameterChange = (paramName, value) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedModel) {
      toast({
        title: 'Model not selected',
        description: 'Please select a model to train',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // For RL models, dataset is not required
    if (!['DQN', 'A2C', 'PPO', 'SAC', 'DDPG', 'TD3'].includes(selectedModelType)) {
      if (!selectedDataset) {
        toast({
          title: 'Dataset not selected',
          description: 'Please select a dataset to train on',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
    }
    
    // For non-RL models, target column is required for custom datasets but not for pre-made datasets
    if (!['DQN', 'A2C', 'PPO', 'SAC', 'DDPG', 'TD3'].includes(selectedModelType)) {
      const selectedDatasetObj = datasets.find(ds => ds.id === selectedDataset);
      const isPreMadeDataset = ['MNIST', 'CIFAR', 'IMDB', 'COCO'].some(name => selectedDatasetObj?.name.includes(name));
      
      if (!isPreMadeDataset && !targetColumn) {
        toast({
          title: 'Target column not specified',
          description: 'Please specify the target column for your custom dataset',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
    }
    
    try {
      const response = await fetch('http://localhost:5001/api/training/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          modelId: selectedModel,
          datasetId: selectedDataset || null, // For RL models, we might not have a dataset
          targetColumn: targetColumn,
          parameters
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Training started successfully',
          description: 'Your model is now training in the background',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        router.push('/training-history');
      } else {
        toast({
          title: 'Training failed',
          description: data.error,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: 'Network error',
        description: 'Please check your connection and try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Get the selected dataset object to show its columns
  const currentDataset = datasets.find(ds => ds.id === selectedDataset);
  
  // Get the selected model type to determine which parameters to show
  const selectedModelType = models.find(m => m._id === selectedModel)?.type || '';
  
  // Check if the selected dataset is a pre-made dataset
  const isPreMadeDataset = currentDataset && ['MNIST', 'CIFAR', 'IMDB', 'COCO'].some(name => currentDataset.name.includes(name));
  
  // Determine appropriate environments for RL models
  const rlEnvironments = {
    'DQN': ['CartPole-v1', 'LunarLander-v2', 'MountainCar-v0', 'Acrobot-v1'],
    'A2C': ['CartPole-v1', 'LunarLander-v2', 'MountainCar-v0', 'Pendulum-v1'],
    'PPO': ['CartPole-v1', 'LunarLander-v2', 'MountainCar-v0', 'Pendulum-v1', 'BipedalWalker-v3'],
    'SAC': ['Pendulum-v1', 'MountainCarContinuous-v0', 'LunarLanderContinuous-v2'],
    'DDPG': ['Pendulum-v1', 'MountainCarContinuous-v0', 'LunarLanderContinuous-v2'],
    'TD3': ['Pendulum-v1', 'MountainCarContinuous-v0', 'LunarLanderContinuous-v2']
  };
  
  // Determine appropriate datasets for each model type
  const modelDatasets = {
    'RNN': ['Time Series Data', 'Text Data', 'Sequential Data'],
    'LSTM': ['Time Series Data', 'Text Data', 'Sequential Data'],
    'GRU': ['Time Series Data', 'Text Data', 'Sequential Data'],
    'CNN': ['Image Data', 'MNIST', 'CIFAR', 'COCO'],
    'ResNet': ['Image Data', 'MNIST', 'CIFAR', 'COCO'],
    'Inception': ['Image Data', 'CIFAR', 'COCO'],
    'VGG': ['Image Data', 'MNIST', 'CIFAR'],
    'GPT-2': ['Text Data', 'Books', 'Articles'],
    'GPT-3': ['Text Data', 'Web Text', 'Books'],
    'GPT-3.5': ['Text Data', 'Web Text', 'Books'],
    'GPT-4': ['Text Data', 'Web Text', 'Books'],
    'BERT': ['Text Data', 'Wikipedia', 'Books'],
    'T5': ['Text Data', 'Web Text', 'Books'],
    'DQN': ['CartPole-v1', 'LunarLander-v2', 'MountainCar-v0'],
    'A2C': ['CartPole-v1', 'LunarLander-v2', 'MountainCar-v0'],
    'PPO': ['CartPole-v1', 'LunarLander-v2', 'MountainCar-v0', 'BipedalWalker-v3'],
    'SAC': ['Pendulum-v1', 'MountainCarContinuous-v0'],
    'DDPG': ['Pendulum-v1', 'MountainCarContinuous-v0'],
    'TD3': ['Pendulum-v1', 'MountainCarContinuous-v0'],
    'Random Forest': ['Tabular Data', 'CSV Data', 'Structured Data'],
    'Gradient Boosting': ['Tabular Data', 'CSV Data', 'Structured Data'],
    'XGBoost': ['Tabular Data', 'CSV Data', 'Structured Data'],
    'LightGBM': ['Tabular Data', 'CSV Data', 'Structured Data']
  };
  
  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={bg}>
        <Text>Loading...</Text>
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
                <Heading as="h1" size="lg">Train New Model</Heading>
                <Text color="gray.500">Configure and start training your machine learning model</Text>
              </VStack>
              <Flex align="center" gap={4}>
                <Box p={3} bg="teal.100" borderRadius="md">
                  <Flex align="center" gap={2}>
                    <Icon as={FiDollarSign} color="teal.500" />
                    <Text fontWeight="bold">{user?.credits || 100} credits</Text>
                  </Flex>
                </Box>
              </Flex>
            </Flex>
          </motion.div>
          
          {/* Create New Model Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card bg={cardBg}>
              <CardHeader>
                <Flex align="center" justify="space-between">
                  <Flex align="center">
                    <Icon as={FiPlus} w={6} h={6} color="teal.500" mr={3} />
                    <Heading as="h3" size="md">Create New Model</Heading>
                  </Flex>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowCreateModel(!showCreateModel)}
                  >
                    {showCreateModel ? 'Cancel' : 'Create Model'}
                  </Button>
                </Flex>
              </CardHeader>
              {showCreateModel && (
                <CardBody>
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
                    <FormControl id="modelName" isRequired>
                      <FormLabel>Model Name</FormLabel>
                      <Input 
                        value={newModel.name}
                        onChange={(e) => setNewModel(prev => ({...prev, name: e.target.value}))}
                        placeholder="Enter model name"
                      />
                    </FormControl>
                    
                    <FormControl id="modelType" isRequired>
                      <FormLabel>Model Type</FormLabel>
                      <Select
                        value={newModel.type}
                        onChange={(e) => setNewModel(prev => ({...prev, type: e.target.value}))}
                        placeholder="Select type"
                      >
                        {/* RNN Options */}
                        <optgroup label="RNN Models">
                          <option value="RNN">RNN</option>
                          <option value="LSTM">LSTM</option>
                          <option value="GRU">GRU</option>
                        </optgroup>
                        
                        {/* CNN Options */}
                        <optgroup label="CNN Models">
                          <option value="CNN">CNN</option>
                          <option value="ResNet">ResNet</option>
                          <option value="Inception">Inception</option>
                          <option value="VGG">VGG</option>
                        </optgroup>
                        
                        {/* GPT Options */}
                        <optgroup label="Transformer Models">
                          <option value="GPT-2">GPT-2</option>
                          <option value="GPT-3">GPT-3</option>
                          <option value="GPT-3.5">GPT-3.5</option>
                          <option value="GPT-4">GPT-4</option>
                          <option value="BERT">BERT</option>
                          <option value="T5">T5</option>
                        </optgroup>
                        
                        {/* RL Options */}
                        <optgroup label="Reinforcement Learning">
                          <option value="DQN">DQN</option>
                          <option value="A2C">A2C</option>
                          <option value="PPO">PPO</option>
                          <option value="SAC">SAC</option>
                          <option value="DDPG">DDPG</option>
                          <option value="TD3">TD3</option>
                        </optgroup>
                        
                        {/* Ensemble Options */}
                        <optgroup label="Ensemble Models">
                          <option value="Random Forest">Random Forest</option>
                          <option value="Gradient Boosting">Gradient Boosting</option>
                          <option value="XGBoost">XGBoost</option>
                          <option value="LightGBM">LightGBM</option>
                        </optgroup>
                      </Select>
                    </FormControl>
                    
                    <Flex align="end">
                      <Button 
                        colorScheme="teal" 
                        leftIcon={<FiPlus />}
                        onClick={handleCreateModel}
                        width="full"
                      >
                        Create Model
                      </Button>
                    </Flex>
                  </Grid>
                </CardBody>
              )}
            </Card>
          </motion.div>
          
          {/* Training Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card bg={cardBg}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiCpu} w={6} h={6} color="teal.500" mr={3} />
                  <Heading as="h3" size="md">Model Configuration</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit}>
                  <VStack spacing={6} align="stretch">
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                      <FormControl id="model" isRequired>
                        <FormLabel>Model Type</FormLabel>
                        <Select 
                          value={selectedModel} 
                          onChange={(e) => setSelectedModel(e.target.value)}
                          placeholder={models.length > 0 ? "Select a model" : "No models available"}
                          isDisabled={models.length === 0}
                        >
                          {models.map(model => (
                            <option key={model._id} value={model._id}>
                              {model.name} ({model.type})
                            </option>
                          ))}
                        </Select>
                        {models.length === 0 && (
                          <Text mt={2} fontSize="sm" color="orange.500">
                            No models available. Please create a model first or click "Create Model" above.
                          </Text>
                        )}
                      </FormControl>
                      
                      {/* Show dataset selection only for non-RL models */}
                      {!['DQN', 'A2C', 'PPO', 'SAC', 'DDPG', 'TD3'].includes(selectedModelType) && (
                        <FormControl id="dataset" isRequired>
                          <FormLabel>Dataset</FormLabel>
                          <Select 
                            value={selectedDataset} 
                            onChange={(e) => {
                              setSelectedDataset(e.target.value);
                              // Reset target column when dataset changes
                              setTargetColumn('');
                            }}
                            placeholder={datasets.length > 0 ? "Select a dataset" : "No datasets available"}
                            isDisabled={datasets.length === 0}
                          >
                            {Array.isArray(datasets) && datasets.map(dataset => (
                              <option key={dataset.id} value={dataset.id}>
                                {dataset.name} ({dataset.type})
                              </option>
                            ))}
                          </Select>
                          {datasets.length === 0 && (
                            <Text mt={2} fontSize="sm" color="orange.500">
                              No datasets available. Please upload a dataset first.
                            </Text>
                          )}
                        </FormControl>
                      )}
                      
                      {/* Show environment selection only for RL models */}
                      {['DQN', 'A2C', 'PPO', 'SAC', 'DDPG', 'TD3'].includes(selectedModelType) && (
                        <FormControl id="environment" isRequired>
                          <FormLabel>Environment</FormLabel>
                          <Select 
                            value={parameters.environment} 
                            onChange={(e) => handleParameterChange('environment', e.target.value)}
                          >
                            {(rlEnvironments[selectedModelType] || ['CartPole-v1', 'Pendulum-v1', 'LunarLander-v2']).map(env => (
                              <option key={env} value={env}>{env}</option>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </Grid>
                    
                    {/* Info about appropriate datasets for the selected model */}
                    {selectedModelType && !['DQN', 'A2C', 'PPO', 'SAC', 'DDPG', 'TD3'].includes(selectedModelType) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Box p={4} bg="green.100" borderRadius="md">
                          <Text fontWeight="bold" color="green.800">
                            Recommended datasets for {selectedModelType}: {modelDatasets[selectedModelType]?.join(', ') || 'Any dataset'}
                          </Text>
                        </Box>
                      </motion.div>
                    )}
                    
                    {/* Info about appropriate environments for RL models */}
                    {selectedModelType && ['DQN', 'A2C', 'PPO', 'SAC', 'DDPG', 'TD3'].includes(selectedModelType) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Box p={4} bg="purple.100" borderRadius="md">
                          <Text fontWeight="bold" color="purple.800">
                            RL environment for {selectedModelType}: {parameters.environment}
                          </Text>
                          <Text fontSize="sm" color="purple.700">
                            No dataset required for reinforcement learning models.
                          </Text>
                        </Box>
                      </motion.div>
                    )}
                    
                    {/* Dataset columns info */}
                    {selectedDataset && !['DQN', 'A2C', 'PPO', 'SAC', 'DDPG', 'TD3'].includes(selectedModelType) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Box p={4} bg="yellow.100" borderRadius="md">
                          <Text fontWeight="bold" color="yellow.800">
                            Columns in {currentDataset?.name}:
                          </Text>
                          <Flex wrap="wrap" gap={2} mt={2}>
                            {currentDataset?.columns?.map((col, index) => (
                              <Box 
                                key={index} 
                                px={3} 
                                py={1} 
                                bg="yellow.200" 
                                borderRadius="md" 
                                fontSize="sm"
                              >
                                {col}
                              </Box>
                            ))}
                          </Flex>
                        </Box>
                      </motion.div>
                    )}
                    
                    {/* Target Column for Supervised Learning */}
                    {selectedDataset && !['DQN', 'A2C', 'PPO', 'SAC', 'DDPG', 'TD3'].includes(selectedModelType) && !isPreMadeDataset && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                          <FormControl id="targetColumn" isRequired>
                            <FormLabel>Target Column Name</FormLabel>
                            <Input
                              value={targetColumn}
                              onChange={(e) => setTargetColumn(e.target.value)}
                              placeholder="Enter target column name"
                            />
                          </FormControl>
                          
                          <FormControl id="columnsInfo">
                            <FormLabel>Dataset Info</FormLabel>
                            <Input 
                              value={`${currentDataset?.type.toUpperCase()} - ${currentDataset?.size} - ${currentDataset?.name}`}
                              isDisabled
                              placeholder="Select a dataset first"
                            />
                          </FormControl>
                        </Grid>
                      </motion.div>
                    )}
                    
                    {/* Info for pre-made datasets */}
                    {selectedDataset && !['DQN', 'A2C', 'PPO', 'SAC', 'DDPG', 'TD3'].includes(selectedModelType) && isPreMadeDataset && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Box p={4} bg="blue.100" borderRadius="md">
                          <Text fontWeight="bold" color="blue.800">
                            Pre-made dataset detected: {currentDataset?.name}
                          </Text>
                          <Text fontSize="sm" color="blue.700">
                            Target column is automatically configured for this dataset.
                          </Text>
                        </Box>
                      </motion.div>
                    )}
                    
                    {/* Dynamic Parameter Controls */}
                    {selectedModel && (
                      <VStack spacing={4} align="stretch">
                        <Heading as="h4" size="sm">Training Parameters</Heading>
                        
                        {/* Learning Rate */}
                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                          <FormControl id="learningRate">
                            <FormLabel>Learning Rate</FormLabel>
                            <NumberInput 
                              value={parameters.learningRate} 
                              onChange={(value) => handleParameterChange('learningRate', parseFloat(value))}
                              min={0.00001}
                              max={1}
                              step={0.0001}
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                          </FormControl>
                          
                          {/* For non-RL models */}
                          {!['DQN', 'A2C', 'PPO', 'SAC', 'DDPG', 'TD3'].includes(selectedModelType) && (
                            <>
                              <FormControl id="epochs">
                                <FormLabel>Epochs</FormLabel>
                                <NumberInput 
                                  value={parameters.epochs} 
                                  onChange={(value) => handleParameterChange('epochs', parseInt(value))}
                                  min={1}
                                  max={1000}
                                >
                                  <NumberInputField />
                                  <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                  </NumberInputStepper>
                                </NumberInput>
                              </FormControl>
                              
                              <FormControl id="batchSize">
                                <FormLabel>Batch Size</FormLabel>
                                <NumberInput 
                                  value={parameters.batchSize} 
                                  onChange={(value) => handleParameterChange('batchSize', parseInt(value))}
                                  min={1}
                                  max={512}
                                >
                                  <NumberInputField />
                                  <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                  </NumberInputStepper>
                                </NumberInput>
                              </FormControl>
                            </>
                          )}
                          
                          {/* For RL models */}
                          {['DQN', 'A2C', 'PPO', 'SAC', 'DDPG', 'TD3'].includes(selectedModelType) && (
                            <>
                              <FormControl id="timesteps">
                                <FormLabel>Timesteps</FormLabel>
                                <NumberInput 
                                  value={parameters.timesteps} 
                                  onChange={(value) => handleParameterChange('timesteps', parseInt(value))}
                                  min={100}
                                  max={100000}
                                >
                                  <NumberInputField />
                                  <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                  </NumberInputStepper>
                                </NumberInput>
                              </FormControl>
                            </>
                          )}
                        </Grid>
                      </VStack>
                    )}
                    
                    <Flex gap={4} justify="flex-end">
                      <Button 
                        variant="outline"
                        colorScheme="gray"
                        leftIcon={<FiUpload />}
                        onClick={() => router.push('/data')}
                      >
                        Manage Datasets
                      </Button>
                      <Button 
                        type="submit" 
                        colorScheme="teal" 
                        size="lg"
                        leftIcon={<FiZap />}
                        isDisabled={!selectedModel || (!['DQN', 'A2C', 'PPO', 'SAC', 'DDPG', 'TD3'].includes(selectedModelType) && !selectedDataset)}
                      >
                        Start Training
                      </Button>
                    </Flex>
                  </VStack>
                </form>
              </CardBody>
            </Card>
          </motion.div>
          
          {/* Model Info */}
          {selectedModel && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card bg={cardBg}>
                <CardHeader>
                  <Flex align="center">
                    <Icon as={FiBarChart2} w={6} h={6} color="blue.500" mr={3} />
                    <Heading as="h3" size="md">Model Information</Heading>
                  </Flex>
                </CardHeader>
                <CardBody>
                  {(() => {
                    const model = models.find(m => m._id === selectedModel);
                    if (!model) return null;
                    
                    return (
                      <VStack align="start" spacing={3}>
                        <Text><strong>Name:</strong> {model.name}</Text>
                        <Text><strong>Type:</strong> {model.type}</Text>
                        <Text><strong>Architecture:</strong> {model.architecture}</Text>
                        <Text><strong>Description:</strong> {model.description}</Text>
                      </VStack>
                    );
                  })()}
                </CardBody>
              </Card>
            </motion.div>
          )}
        </VStack>
      </Box>
    </Box>
  );
}