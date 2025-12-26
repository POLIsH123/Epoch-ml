import { Box, Heading, Text, Button, VStack, Container, Card, CardHeader, CardBody, Grid, FormControl, FormLabel, Select, Input, useColorModeValue, useToast, Flex, Icon, Spinner } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiPlus, FiCpu, FiDatabase, FiLayers, FiBarChart2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

export default function Models() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState([]);
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
        
        // Get user's models
        return fetch('http://localhost:5001/api/models', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    })
    .then(res => res.json())
    .then(data => {
      // Filter out GPT/BERT models and RL models
      const filteredModels = Array.isArray(data) ? 
        data.filter(model => 
          model && 
          !['GPT-2', 'GPT-3', 'GPT-3.5', 'GPT-4', 'BERT', 'T5', 'DQN', 'A2C', 'PPO', 'SAC', 'DDPG', 'TD3'].includes(model.type)
        ) : [];
      setModels(filteredModels);
      setLoading(false);
    })
    .catch(err => {
      console.error('Error fetching models:', err);
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
      
      if (response.ok) {
        setModels(prev => [...prev, data.model]);
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
                <Heading as="h1" size="lg">Models</Heading>
                <Text color="gray.500">Create and manage your machine learning models</Text>
              </VStack>
              <Flex align="center" gap={4}>
                <Box p={3} bg="teal.100" borderRadius="md">
                  <Flex align="center" gap={2}>
                    <Icon as={FiCpu} color="teal.500" />
                    <Text fontWeight="bold">{models.length} models</Text>
                  </Flex>
                </Box>
              </Flex>
            </Flex>
          </motion.div>
          
          {/* Create Model Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card bg={cardBg}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiPlus} w={6} h={6} color="teal.500" mr={3} />
                  <Heading as="h3" size="md">Create New Model</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                  <FormControl id="name" isRequired>
                    <FormLabel>Model Name</FormLabel>
                    <Input 
                      value={formData.name} 
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter model name"
                    />
                  </FormControl>
                  
                  <FormControl id="type" isRequired>
                    <FormLabel>Model Type</FormLabel>
                    <Select 
                      value={formData.type} 
                      onChange={(e) => handleInputChange('type', e.target.value)}
                    >
                      <option value="">Select model type</option>
                      {modelTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl id="description">
                    <FormLabel>Description</FormLabel>
                    <Input 
                      value={formData.description} 
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter model description"
                    />
                  </FormControl>
                </Grid>
                
                <Flex justify="flex-end" mt={6}>
                  <Button 
                    colorScheme="teal" 
                    leftIcon={<FiPlus />}
                    onClick={handleCreateModel}
                    isLoading={creating}
                  >
                    Create Model
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          </motion.div>
          
          {/* Models List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {models.length === 0 ? (
              <Card bg={cardBg} textAlign="center" py={12}>
                <VStack spacing={4}>
                  <Icon as={FiCpu} w={16} h={16} color="gray.400" />
                  <Heading as="h2" size="md">No models yet</Heading>
                  <Text color="gray.500">Create your first model to get started</Text>
                </VStack>
              </Card>
            ) : (
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
                {models.filter(model => model).map(model => (
                  <motion.div
                    key={model._id}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card bg={cardBg}>
                      <CardHeader>
                        <Flex justify="space-between" align="center">
                          <Flex align="center" gap={3}>
                            <Icon as={FiCpu} color="teal.500" />
                            <Heading as="h3" size="md">{model.name}</Heading>
                          </Flex>
                        </Flex>
                      </CardHeader>
                      <CardBody>
                        <VStack align="start" spacing={3}>
                          <Text><strong>Type:</strong> {model.type}</Text>
                          <Text><strong>Architecture:</strong> {model.architecture}</Text>
                          <Text><strong>Description:</strong> {model.description}</Text>
                          <Text><strong>Created:</strong> {new Date(model.createdAt).toLocaleDateString()}</Text>
                          
                          <Flex justify="space-between" align="center" width="100%" mt={4}>
                            <Button 
                              variant="outline" 
                              colorScheme="red"
                              size="sm"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this model? This action cannot be undone.')) {
                                  handleDeleteModel(model._id);
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </Flex>
                        </VStack>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </Grid>
            )}
          </motion.div>
        </VStack>
      </Box>
    </Box>
  );
}