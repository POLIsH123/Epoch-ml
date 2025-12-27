import { Box, Heading, Text, Button, VStack, Container, Card, CardHeader, CardBody, Grid, FormControl, FormLabel, Select, Input, useColorModeValue, useToast, Flex, Icon, Spinner } from '@chakra-ui/react';
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

    // Fetch user profile, models, and datasets
    Promise.all([
      fetch('http://localhost:5001/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()),

      fetch('http://localhost:5001/api/models', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()),

      fetch('http://localhost:5001/api/resources/datasets', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json())
    ])
      .then(([userData, modelData, datasetData]) => {
        setUser(userData);
        // Filter out GPT/BERT models and RL models
        const filteredModels = modelData.filter(model =>
          !['GPT-2', 'GPT-3', 'GPT-3.5', 'GPT-4', 'BERT', 'T5', 'DQN', 'A2C', 'PPO', 'SAC', 'DDPG', 'TD3'].includes(model.type)
        );
        setModels(filteredModels);
        setDatasets(datasetData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        localStorage.removeItem('token');
        router.push('/login');
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
            environment: 'CartPole-v1'
          }
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
                <Heading as="h1" size="lg">Train Model</Heading>
                <Text color="gray.500">Configure and start training your machine learning model</Text>
              </VStack>
              <Flex align="center" gap={4}>
                <Box p={3} bg="teal.100" borderRadius="md">
                  <Flex align="center" gap={2}>
                    <Icon as={FiDollarSign} color="teal.500" />
                    <Text fontWeight="bold">{user?.credits || 0} credits</Text>
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
            <Card bg={cardBg}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiZap} w={6} h={6} color="teal.500" mr={3} />
                  <Heading as="h3" size="md">Training Configuration</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                  <FormControl id="modelId" isRequired>
                    <FormLabel>Model</FormLabel>
                    <Select
                      value={formData.modelId}
                      onChange={(e) => handleInputChange('modelId', e.target.value)}
                    >
                      <option value="">Select a model</option>
                      {models.map(model => (
                        <option key={model._id} value={model._id}>
                          {model.name} ({model.type})
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl id="datasetId" isRequired>
                    <FormLabel>Dataset</FormLabel>
                    <Select
                      value={formData.datasetId}
                      onChange={(e) => handleInputChange('datasetId', e.target.value)}
                    >
                      <option value="">Select a dataset</option>
                      {datasets.map(dataset => (
                        <option key={dataset.id} value={dataset.id}>
                          {dataset.name} ({dataset.size})
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl id="targetColumn">
                    <FormLabel>Target Column</FormLabel>
                    <Select
                      value={formData.targetColumn}
                      onChange={(e) => handleInputChange('targetColumn', e.target.value)}
                    >
                      <option value="">Select target column</option>
                      {columns.map(column => (
                        <option key={column} value={column}>
                          {column}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl id="trainingCost">
                    <FormLabel>Training Cost</FormLabel>
                    <Input
                      value={`${trainingCost} credits`}
                      isDisabled
                      bg="gray.100"
                    />
                  </FormControl>
                </Grid>

                {/* Parameters based on model type */}
                {models.find(m => m._id === formData.modelId) && (
                  <Box mt={6}>
                    <Heading as="h4" size="sm" mb={4}>Training Parameters</Heading>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                      <FormControl id="epochs">
                        <FormLabel>Epochs</FormLabel>
                        <Input
                          type="number"
                          value={formData.parameters.epochs}
                          onChange={(e) => handleInputChange('parameters.epochs', parseInt(e.target.value))}
                        />
                      </FormControl>

                      <FormControl id="batchSize">
                        <FormLabel>Batch Size</FormLabel>
                        <Input
                          type="number"
                          value={formData.parameters.batchSize}
                          onChange={(e) => handleInputChange('parameters.batchSize', parseInt(e.target.value))}
                        />
                      </FormControl>

                      <FormControl id="learningRate">
                        <FormLabel>Learning Rate</FormLabel>
                        <Input
                          type="number"
                          step="0.001"
                          value={formData.parameters.learningRate}
                          onChange={(e) => handleInputChange('parameters.learningRate', parseFloat(e.target.value))}
                        />
                      </FormControl>
                    </Grid>
                  </Box>
                )}

                <Flex justify="flex-end" mt={6}>
                  <Button
                    colorScheme="teal"
                    leftIcon={<FiBarChart2 />}
                    onClick={handleSubmit}
                  >
                    Start Training
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          </motion.div>

          {/* Model Information */}
          {formData.modelId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card bg={cardBg}>
                <CardHeader>
                  <Flex align="center">
                    <Icon as={FiCpu} w={6} h={6} color="blue.500" mr={3} />
                    <Heading as="h3" size="md">Model Information</Heading>
                  </Flex>
                </CardHeader>
                <CardBody>
                  {(() => {
                    const model = models.find(m => m._id === formData.modelId);
                    if (!model) return null;

                    return (
                      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                        <VStack align="start" spacing={2}>
                          <Text><strong>Name:</strong> {model.name}</Text>
                          <Text><strong>Type:</strong> {model.type}</Text>
                          <Text><strong>Architecture:</strong> {model.architecture}</Text>
                        </VStack>
                        <VStack align="start" spacing={2}>
                          <Text><strong>Description:</strong> {model.description}</Text>
                          <Text><strong>Created:</strong> {new Date(model.createdAt).toLocaleDateString()}</Text>
                        </VStack>
                      </Grid>
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
