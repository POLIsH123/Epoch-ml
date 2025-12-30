import { Box, Heading, Text, Button, VStack, Container, Card, CardHeader, CardBody, Grid, FormControl, FormLabel, Select, Input, useColorModeValue, useToast, Flex, Icon, Spinner, SimpleGrid, Divider } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiPlus, FiCpu, FiDatabase, FiLayers, FiBarChart2, FiDownload, FiPlay, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

export default function Models() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState([]);
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: ''
  });
  const [creating, setCreating] = useState(false);
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

          // Get user's models and training sessions
          return Promise.all([
            fetch('http://localhost:5001/api/models', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }),
            fetch('http://localhost:5001/api/training', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })
          ]);
        }
      })
      .then(([modelsRes, sessionsRes]) => Promise.all([modelsRes.json(), sessionsRes.json()]))
      .then(([modelsData, sessionsData]) => {
        // Filter out GPT/BERT models and RL models, and ensure no undefined/null models
        const filteredModels = Array.isArray(modelsData) ?
          modelsData.filter(model =>
            model &&
            model.name &&
            !['GPT-2', 'GPT-3', 'GPT-3.5', 'GPT-4', 'BERT', 'T5', 'DQN', 'A2C', 'PPO', 'SAC', 'DDPG', 'TD3'].includes(model.type)
          ) : [];
        setModels(filteredModels);
        
        // Store training sessions
        setTrainingSessions(Array.isArray(sessionsData) ? sessionsData : []);
        
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching models and sessions:', err);
        localStorage.removeItem('token');
        router.push('/login');
      });
  }, [router]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateModel = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.type) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in the model name and type',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Determine architecture based on model type
    const getArchitecture = (type) => {
      if (['LSTM', 'GRU', 'RNN'].includes(type)) return 'RNN';
      if (['CNN', 'ResNet', 'VGG', 'Inception'].includes(type)) return 'CNN';
      if (['Random Forest', 'Gradient Boosting', 'XGBoost', 'LightGBM'].includes(type)) return 'Ensemble';
      return type;
    };

    setCreating(true);

    try {
      const response = await fetch('http://localhost:5001/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          architecture: getArchitecture(formData.type),
          description: formData.description
        })
      });

      const data = await response.json();

      if (response.ok && data) {
        // Make sure we have a valid model in the response
        if (data._id && data.name) {
          setModels(prev => [...prev, data]);
        }
        setFormData({
          name: '',
          type: '',
          description: ''
        });
        toast({
          title: 'Model created',
          description: 'Your model has been created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Creation failed',
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
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteModel = async (modelId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/models/${modelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setModels(prev => prev.filter(model => model && model._id !== modelId));
        toast({
          title: 'Model deleted',
          description: 'Your model has been deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Deletion failed',
          description: data.error || 'Could not delete model',
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

  const handleDownloadModel = async (modelId, modelName) => {
    try {
      const response = await fetch(`http://localhost:5001/api/models/${modelId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Create a blob from the response and trigger download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${modelName.replace(/\s+/g, '_')}_model.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast({
          title: 'Model downloaded',
          description: 'Your model has been downloaded successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: 'Download failed',
          description: errorData.error || 'Could not download model',
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

  const getModelStatus = (modelId) => {
    const activeSession = trainingSessions.find(session => 
      session.modelId === modelId && (session.status === 'running' || session.status === 'queued')
    );
    
    if (activeSession) {
      return { status: activeSession.status, session: activeSession };
    }
    
    // Check if there are any completed/failed sessions for this model
    const completedSession = trainingSessions.find(session => 
      session.modelId === modelId
    );
    
    if (completedSession) {
      return { status: completedSession.status, session: completedSession };
    }
    
    return { status: 'idle', session: null };
  };

  const handleViewMetrics = (modelId) => {
    // Navigate to training history for this model
    router.push(`/training-history/${modelId}`);
  };

  // Define model types excluding GPT/BERT and RL models
  const modelTypes = [
    { value: 'LSTM', label: 'LSTM (Long Short-Term Memory)', category: 'RNN' },
    { value: 'GRU', label: 'GRU (Gated Recurrent Unit)', category: 'RNN' },
    { value: 'RNN', label: 'RNN (Recurrent Neural Network)', category: 'RNN' },
    { value: 'CNN', label: 'CNN (Convolutional Neural Network)', category: 'CNN' },
    { value: 'ResNet', label: 'ResNet (Residual Network)', category: 'CNN' },
    { value: 'VGG', label: 'VGG Network', category: 'CNN' },
    { value: 'Inception', label: 'Inception Network', category: 'CNN' },
    { value: 'Random Forest', label: 'Random Forest', category: 'Ensemble' },
    { value: 'Gradient Boosting', label: 'Gradient Boosting', category: 'Ensemble' },
    { value: 'XGBoost', label: 'XGBoost', category: 'Ensemble' },
    { value: 'LightGBM', label: 'LightGBM', category: 'Ensemble' },
  ];

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
      <Box ml="250px" p={8}>
        <VStack spacing={10} align="stretch">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Flex justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Heading as="h1" size="xl" bgGradient="linear(to-r, teal.300, blue.400)" bgClip="text">
                  Neural Architectures
                </Heading>
                <Text color="gray.500" fontSize="lg">Management terminal for your deployed models.</Text>
              </VStack>
              <Button
                leftIcon={<FiPlus />}
                onClick={() => setCreating(!creating)}
                borderRadius="full"
                className="glass"
                colorScheme="teal"
                variant="outline"
                px={8}
              >
                {creating ? 'Dismiss Terminal' : 'Initialize New Core'}
              </Button>
            </Flex>
          </motion.div>

          {creating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Box className="glass" p={8}>
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="teal.300">Model Configuration</Heading>
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                    <FormControl id="name" isRequired>
                      <FormLabel>Architecture Identifier</FormLabel>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        bg="rgba(0,0,0,0.1)"
                        border="none"
                        _focus={{ ring: '1px solid', ringColor: 'teal.400' }}
                        placeholder="e.g., Alpha-Inference-V1"
                      />
                    </FormControl>

                    <FormControl id="type" isRequired>
                      <FormLabel>Base Neural Type</FormLabel>
                      <Select
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        bg="rgba(0,0,0,0.2)"
                        border="none"
                      >
                        <option value="">Select Architecture...</option>
                        <option value="LSTM">Long Short-Term Memory (LSTM)</option>
                        <option value="GRU">Gated Recurrent Unit (GRU)</option>
                        <option value="CNN">Convolutional Neural Network (CNN)</option>
                        <option value="Transformer">Transformer Core</option>
                      </Select>
                    </FormControl>
                  </Grid>

                  <FormControl id="description">
                    <FormLabel>Functional Description</FormLabel>
                    <Input
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      bg="rgba(0,0,0,0.1)"
                      border="none"
                      placeholder="Neural behavioral mission parameters..."
                    />
                  </FormControl>

                  <Button
                    onClick={handleCreateModel}
                    colorScheme="teal"
                    borderRadius="full"
                    bgGradient="linear(to-r, teal.400, blue.500)"
                    _hover={{ bgGradient: 'linear(to-r, teal.500, blue.600)' }}
                    alignSelf="flex-end"
                    px={12}
                  >
                    Deploy Architecture
                  </Button>
                </VStack>
              </Box>
            </motion.div>
          )}

          {/* Models Grid */}
          {loading ? (
            <Flex justify="center" p={20}><Spinner size="xl" /></Flex>
          ) : models.length === 0 ? (
            <Box className="glass" p={20} textAlign="center">
              <Icon as={FiCpu} w={12} h={12} color="gray.600" mb={4} />
              <Text color="gray.500">No architectures currently deployed.</Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {models.map((model, index) => (
                <motion.div
                  key={model.id || model._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Box className="glass" p={6} position="relative" overflow="hidden">
                    <Flex justify="space-between" align="start" mb={4}>
                      <VStack align="start" spacing={0}>
                        <Heading size="md" color="teal.300" noOfLines={1}>{model.name}</Heading>
                        <Text fontSize="xs" color="gray.500" textTransform="uppercase">{model.type}</Text>
                      </VStack>
                      <Icon as={FiLayers} w={6} h={6} color="blue.400" />
                    </Flex>

                    <Text fontSize="sm" color="gray.400" mb={2} noOfLines={2}>
                      {model.description || 'No description available for this architecture.'}
                    </Text>
                    
                    {/* Model Status */}
                    <Flex align="center" mb={4}>
                      {getModelStatus(model.id || model._id).status !== 'idle' ? (
                        <Flex align="center" gap={2}>
                          <Box w={2} h={2} bg={getModelStatus(model.id || model._id).status === 'running' ? 'green.400' : 'yellow.400'} borderRadius="50%" />
                          <Text fontSize="xs" textTransform="uppercase" color={getModelStatus(model.id || model._id).status === 'running' ? 'green.400' : 'yellow.400'}>
                            {getModelStatus(model.id || model._id).status.toUpperCase()}
                          </Text>
                        </Flex>
                      ) : (
                        <Flex align="center" gap={2}>
                          <Box w={2} h={2} bg="gray.400" borderRadius="50%" />
                          <Text fontSize="xs" textTransform="uppercase" color="gray.400">
                            IDLE
                          </Text>
                        </Flex>
                      )}
                    </Flex>

                    <Divider borderColor="whiteAlpha.100" mb={6} />

                    <Flex justify="space-between" align="center">
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        leftIcon={<FiPlay />}
                        onClick={() => router.push(`/models/${model.id || model._id}`)}
                        borderRadius="full"
                      >
                        Synchronize
                      </Button>
                      
                      <Flex gap={2}>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="teal"
                          leftIcon={<FiBarChart2 />}
                          onClick={() => handleViewMetrics(model.id || model._id)}
                          borderRadius="full"
                        >
                          Metrics
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          leftIcon={<FiTrash2 />}
                          onClick={() => {
                            if (window.confirm('Purge this architecture from the mainframe?')) {
                              handleDeleteModel(model.id || model._id);
                            }
                          }}
                          borderRadius="full"
                        >
                          Purge
                        </Button>
                      </Flex>
                    </Flex>
                  </Box>
                </motion.div>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Box>
    </Box>
  );
}