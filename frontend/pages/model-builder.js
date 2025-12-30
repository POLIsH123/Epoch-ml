import { Box, Heading, Text, Button, VStack, Container, Card, CardBody, Flex, Icon, useColorModeValue, useToast, Grid, FormControl, FormLabel, Select, Input, Textarea } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiPlus, FiTrash2, FiLayers, FiCpu, FiDatabase, FiPlay, FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

export default function ModelBuilder() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modelLayers, setModelLayers] = useState([
    { id: 1, type: 'Dense', config: { units: 64, activation: 'relu' } }
  ]);
  const [modelConfig, setModelConfig] = useState({
    name: '',
    description: '',
    outputLayer: 'Dense'
  });
  const [nextId, setNextId] = useState(2);
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
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Error fetching user data:', err);
        localStorage.removeItem('token');
        router.push('/login');
      });
  }, [router]);

  const addLayer = () => {
    const newLayer = {
      id: nextId,
      type: 'Dense',
      config: { units: 64, activation: 'relu' }
    };
    setModelLayers([...modelLayers, newLayer]);
    setNextId(nextId + 1);
  };

  const removeLayer = (id) => {
    if (modelLayers.length <= 1) {
      toast({
        title: 'Minimum layers required',
        description: 'A model must have at least one layer',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setModelLayers(modelLayers.filter(layer => layer.id !== id));
  };

  const updateLayer = (id, field, value) => {
    setModelLayers(modelLayers.map(layer => 
      layer.id === id 
        ? { ...layer, [field]: value } 
        : layer
    ));
  };

  const updateLayerConfig = (id, configField, value) => {
    setModelLayers(modelLayers.map(layer => 
      layer.id === id 
        ? { ...layer, config: { ...layer.config, [configField]: value } } 
        : layer
    ));
  };

  const handleInputChange = (field, value) => {
    setModelConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateModel = async (e) => {
    e.preventDefault();

    if (!modelConfig.name) {
      toast({
        title: 'Missing required field',
        description: 'Please provide a model name',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (modelLayers.length === 0) {
      toast({
        title: 'No layers added',
        description: 'Please add at least one layer to your model',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: modelConfig.name,
          description: modelConfig.description,
          type: 'Custom',
          architecture: 'Multi-Layer',
          layers: modelLayers
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Model created',
          description: 'Your multi-layer model has been created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        router.push('/models');
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
    }
  };

  const layerTypes = [
    { value: 'Dense', label: 'Dense (Fully Connected)', description: 'Standard fully connected layer' },
    { value: 'Conv2D', label: 'Conv2D (Convolutional)', description: 'For image processing tasks' },
    { value: 'LSTM', label: 'LSTM (Long Short-Term Memory)', description: 'For sequence processing' },
    { value: 'GRU', label: 'GRU (Gated Recurrent Unit)', description: 'For sequence processing' },
    { value: 'Dropout', label: 'Dropout', description: 'For regularization' },
    { value: 'Flatten', label: 'Flatten', description: 'Convert multi-dimensional to 1D' },
    { value: 'MaxPooling2D', label: 'MaxPooling2D', description: 'For image downsampling' }
  ];

  const activationFunctions = [
    { value: 'relu', label: 'ReLU' },
    { value: 'sigmoid', label: 'Sigmoid' },
    { value: 'tanh', label: 'Tanh' },
    { value: 'softmax', label: 'Softmax' },
    { value: 'linear', label: 'Linear' }
  ];

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
                  Neural Architecture Builder
                </Heading>
                <Text color="gray.500" fontSize="lg">Construct custom multi-layer neural networks.</Text>
              </VStack>
              <Button
                leftIcon={<FiPlay />}
                onClick={handleCreateModel}
                colorScheme="teal"
                borderRadius="full"
                px={8}
              >
                Deploy Architecture
              </Button>
            </Flex>
          </motion.div>

          {/* Model Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="glass" bg={cardBg}>
              <CardBody>
                <VStack align="stretch" spacing={6}>
                  <Heading size="md" color="teal.300">Model Configuration</Heading>
                  
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                    <FormControl id="name" isRequired>
                      <FormLabel>Model Name</FormLabel>
                      <Input
                        value={modelConfig.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        bg="rgba(0,0,0,0.1)"
                        border="none"
                        _focus={{ ring: '1px solid', ringColor: 'teal.400' }}
                        placeholder="e.g., My Multi-Layer Network"
                      />
                    </FormControl>

                    <FormControl id="outputLayer">
                      <FormLabel>Output Layer Type</FormLabel>
                      <Select
                        value={modelConfig.outputLayer}
                        onChange={(e) => handleInputChange('outputLayer', e.target.value)}
                        bg="rgba(0,0,0,0.2)"
                        border="none"
                      >
                        <option value="Dense">Dense (Classification/Regression)</option>
                        <option value="Sigmoid">Sigmoid (Binary Classification)</option>
                        <option value="Softmax">Softmax (Multi-class Classification)</option>
                      </Select>
                    </FormControl>
                  </Grid>

                  <FormControl id="description">
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={modelConfig.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      bg="rgba(0,0,0,0.1)"
                      border="none"
                      placeholder="Describe your model's purpose..."
                      rows={3}
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </motion.div>

          {/* Layer Builder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="glass" bg={cardBg}>
              <CardBody>
                <Flex justify="space-between" align="center" mb={6}>
                  <Heading size="md" color="teal.300">Layer Architecture</Heading>
                  <Button
                    leftIcon={<FiPlus />}
                    onClick={addLayer}
                    colorScheme="blue"
                    variant="outline"
                    borderRadius="full"
                  >
                    Add Layer
                  </Button>
                </Flex>
                
                <VStack align="stretch" spacing={4}>
                  {modelLayers.map((layer, index) => (
                    <motion.div
                      key={layer.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card bg="rgba(0,0,0,0.2)" borderWidth="1px" borderColor="whiteAlpha.200">
                        <CardBody p={4}>
                          <Flex justify="space-between" align="start" mb={4}>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold" color="teal.300">Layer {index + 1}</Text>
                              <Text fontSize="sm" color="gray.400">Type: {layer.type}</Text>
                            </VStack>
                            <Button
                              leftIcon={<FiTrash2 />}
                              onClick={() => removeLayer(layer.id)}
                              colorScheme="red"
                              variant="ghost"
                              size="sm"
                              borderRadius="full"
                            >
                              Remove
                            </Button>
                          </Flex>

                          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                            <FormControl>
                              <FormLabel fontSize="xs">Layer Type</FormLabel>
                              <Select
                                value={layer.type}
                                onChange={(e) => updateLayer(layer.id, 'type', e.target.value)}
                                bg="rgba(0,0,0,0.3)"
                                border="none"
                                size="sm"
                              >
                                {layerTypes.map(type => (
                                  <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                              </Select>
                              <Text fontSize="2xs" color="gray.500" mt={1}>{layerTypes.find(t => t.value === layer.type)?.description}</Text>
                            </FormControl>

                            {['Dense', 'LSTM', 'GRU'].includes(layer.type) && (
                              <FormControl>
                                <FormLabel fontSize="xs">Units/Neurons</FormLabel>
                                <Input
                                  type="number"
                                  value={layer.config.units || 64}
                                  onChange={(e) => updateLayerConfig(layer.id, 'units', parseInt(e.target.value))}
                                  bg="rgba(0,0,0,0.3)"
                                  border="none"
                                  size="sm"
                                />
                              </FormControl>
                            )}

                            {layer.type !== 'Flatten' && layer.type !== 'MaxPooling2D' && (
                              <FormControl>
                                <FormLabel fontSize="xs">Activation</FormLabel>
                                <Select
                                  value={layer.config.activation || 'relu'}
                                  onChange={(e) => updateLayerConfig(layer.id, 'activation', e.target.value)}
                                  bg="rgba(0,0,0,0.3)"
                                  border="none"
                                  size="sm"
                                >
                                  {activationFunctions.map(func => (
                                    <option key={func.value} value={func.value}>{func.label}</option>
                                  ))}
                                </Select>
                              </FormControl>
                            )}
                          </Grid>
                        </CardBody>
                      </Card>
                    </motion.div>
                  ))}
                </VStack>

                {modelLayers.length === 0 && (
                  <Flex direction="column" align="center" justify="center" py={10} color="gray.500">
                    <Icon as={FiLayers} w={12} h={12} mb={4} />
                    <Text fontSize="lg">No layers added yet</Text>
                    <Text fontSize="sm">Click "Add Layer" to start building your model</Text>
                  </Flex>
                )}
              </CardBody>
            </Card>
          </motion.div>

          {/* Layer Guidance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="glass" bg={cardBg}>
              <CardBody>
                <Flex align="start" gap={4}>
                  <Icon as={FiInfo} w={6} h={6} color="blue.400" mt={1} />
                  <VStack align="start" spacing={2}>
                    <Heading size="sm" color="blue.300">Layer Building Tips</Heading>
                    <Text fontSize="sm" color="gray.400">
                      <strong>Input Layer:</strong> Automatically inferred from your data shape
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      <strong>Hidden Layers:</strong> Start with Dense layers for tabular data or Conv2D for images
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      <strong>Sequence Data:</strong> Use LSTM/GRU layers for time series or text
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      <strong>Regularization:</strong> Add Dropout layers to prevent overfitting
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      <strong>Output Layer:</strong> Dense for regression, Softmax for classification
                    </Text>
                  </VStack>
                </Flex>
              </CardBody>
            </Card>
          </motion.div>
        </VStack>
      </Box>
    </Box>
  );
}