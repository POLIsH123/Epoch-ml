import { Box, Heading, Text, Button, VStack, Container, Select, FormControl, FormLabel, Input, Card, CardHeader, CardBody, Flex, Icon, useColorModeValue, useToast, Grid, GridItem, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiCpu, FiBarChart2, FiZap, FiDollarSign, FiDatabase, FiSliders } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function TrainModel() {
  const [user, setUser] = useState(null);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState('');
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
        
        // Get available models
        return fetch('http://localhost:5001/api/models', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    })
    .then(res => res.json())
    .then(data => {
      setModels(data);
      setLoading(false);
    })
    .catch(err => {
      console.error('Error fetching data:', err);
      localStorage.removeItem('token');
      router.push('/login');
    });
  }, [router]);
  
  const handleParameterChange = (paramName, value) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5001/api/training/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          modelId: selectedModel,
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
  
  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={bg}>
        <Text>Loading...</Text>
      </Flex>
    );
  }
  
  return (
    <Box minH="100vh" bg={bg} py={8}>
      <Container maxW="container.xl">
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
          
          {/* Training Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
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
                    <FormControl id="model" isRequired>
                      <FormLabel>Model Type</FormLabel>
                      <Select 
                        value={selectedModel} 
                        onChange={(e) => setSelectedModel(e.target.value)}
                        placeholder="Select a model"
                      >
                        {models.map(model => (
                          <option key={model._id} value={model._id}>
                            {model.name} ({model.type})
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    
                    {/* Dynamic Parameter Controls */}
                    {selectedModel && (
                      <VStack spacing={4} align="stretch">
                        <Heading as="h4" size="sm">Training Parameters</Heading>
                        
                        {/* Learning Rate */}
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
                        {!(selectedModel.includes('5') || selectedModel.includes('6') || selectedModel.includes('7') || 
                           selectedModel.includes('8') || selectedModel.includes('9')) && (
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
                        {(selectedModel.includes('5') || selectedModel.includes('6') || selectedModel.includes('7') || 
                          selectedModel.includes('8') || selectedModel.includes('9')) && (
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
                            
                            <FormControl id="environment">
                              <FormLabel>Environment</FormLabel>
                              <Select 
                                value={parameters.environment} 
                                onChange={(e) => handleParameterChange('environment', e.target.value)}
                              >
                                <option value="CartPole-v1">CartPole-v1 (Simple)</option>
                                <option value="Pendulum-v1">Pendulum-v1 (Continuous)</option>
                                <option value="LunarLander-v2">LunarLander-v2 (Complex)</option>
                              </Select>
                            </FormControl>
                          </>
                        )}
                      </VStack>
                    )}
                    
                    <Button 
                      type="submit" 
                      colorScheme="teal" 
                      size="lg"
                      leftIcon={<FiZap />}
                      isDisabled={!selectedModel}
                    >
                      Start Training
                    </Button>
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
              transition={{ duration: 0.5, delay: 0.2 }}
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
      </Container>
    </Box>
  );
}