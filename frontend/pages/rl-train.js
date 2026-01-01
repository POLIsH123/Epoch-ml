import { Box, Heading, Text, Button, VStack, Container, Card, CardHeader, CardBody, Grid, FormControl, FormLabel, Select, Input, useColorModeValue, useToast, Flex, Icon, Spinner } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiZap, FiTarget, FiBarChart2, FiDollarSign, FiPlay } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

export default function RLTrain() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState([]);
  const [hasActiveTraining, setHasActiveTraining] = useState(false);
  const [formData, setFormData] = useState({
    modelId: '',
    environmentName: '',
    parameters: {
      architecture: 'DQN',
      timesteps: 10000,
      learningRate: 0.001
    }
  });
  const [trainingCost, setTrainingCost] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  // Available RL environments
  const environments = [
    { id: 'CartPole-v1', name: 'Cart Pole', description: 'Balance a pole on a cart' },
    { id: 'MountainCar-v0', name: 'Mountain Car', description: 'Climb a hill with momentum' },
    { id: 'Pendulum-v1', name: 'Pendulum', description: 'Swing up a pendulum' },
    { id: 'LunarLander-v2', name: 'Lunar Lander', description: 'Land a spacecraft safely' },
    { id: 'Acrobot-v1', name: 'Acrobot', description: 'Swing up a two-link robot' },
    { id: 'FrozenLake-v1', name: 'Frozen Lake', description: 'Navigate a frozen lake grid' }
  ];

  // RL Algorithms
  const algorithms = [
    { id: 'DQN', name: 'Deep Q-Network', description: 'Value-based, discrete actions' },
    { id: 'PPO', name: 'Proximal Policy Optimization', description: 'Policy-based, continuous/discrete' },
    { id: 'A2C', name: 'Advantage Actor-Critic', description: 'Policy-based, synchronous' },
    { id: 'SAC', name: 'Soft Actor-Critic', description: 'Policy-based, continuous actions' },
    { id: 'TD3', name: 'Twin Delayed DDPG', description: 'Policy-based, continuous actions' }
  ];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('http://localhost:5001/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
        return;
      }
    };

    const fetchModels = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/models', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const modelsData = await response.json();
          // Filter to only show RL models
          const rlModels = modelsData.filter(model => model.type === 'RL');
          setModels(rlModels);
        }
      } catch (error) {
        console.error('Failed to fetch models:', error);
      }
    };

    const checkActiveTraining = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/training', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const sessions = await response.json();
          const hasActive = sessions.some(session => ['queued', 'running'].includes(session.status));
          setHasActiveTraining(hasActive);
        }
      } catch (error) {
        console.error('Failed to check active training:', error);
      }
    };

    Promise.all([checkAuth(), fetchModels(), checkActiveTraining()]).then(() => {
      setLoading(false);
    });
  }, [router]);

  // Calculate training cost based on algorithm, timesteps, and learning rate
  useEffect(() => {
    // Base cost based on algorithm
    let baseCost = 20; // Default base cost for RL training
    
    switch (formData.parameters.architecture) {
      case 'PPO':
      case 'SAC':
        baseCost = 30;
        break;
      case 'DQN':
      case 'A2C':
      case 'TD3':
        baseCost = 20;
        break;
      default:
        baseCost = 20;
    }

    // Multipliers for different parameters
    const timesteps = formData.parameters.timesteps || 10000;
    const learningRate = formData.parameters.learningRate || 0.001;
    
    // Timesteps multiplier: more timesteps = more cost (equivalent to epochs for RL)
    const timestepMultiplier = Math.max(1, timesteps / 10000);
    
    // Learning rate multiplier: lower learning rate = more training needed = more cost
    const lrMultiplier = Math.max(0.9, 0.001 / learningRate);
    
    // Calculate total cost
    const totalCost = Math.round(baseCost * timestepMultiplier * lrMultiplier);
    setTrainingCost(totalCost);
  }, [formData.parameters.timesteps, formData.parameters.architecture, formData.parameters.learningRate]);

  const handleInputChange = (field, value) => {
    if (field.startsWith('parameters.')) {
      const paramField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        parameters: {
          ...prev.parameters,
          [paramField]: value
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

    if (!formData.modelId || !formData.environmentName) {
      toast({
        title: 'Missing information',
        description: 'Please select a model and environment',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/training/rl-train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'RL Training started',
          description: `Training ${formData.parameters.architecture} in ${formData.environmentName}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        router.push('/training-history');
      } else {
        toast({
          title: 'Training failed',
          description: data.error || 'Could not start RL training',
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
                <Heading as="h1" size="lg">RL Training</Heading>
                <Text color="gray.500">Train reinforcement learning agents in interactive environments</Text>
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

          {/* RL Training Form */}
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
                      <FormLabel fontWeight="bold" color="teal.400">RL Model</FormLabel>
                      <Select
                        value={formData.modelId}
                        onChange={(e) => handleInputChange('modelId', e.target.value)}
                        placeholder="Choose an RL model..."
                        bg="rgba(0,0,0,0.1)"
                      >
                        {models.map(model => (
                          <option key={model._id} value={model._id}>
                            {model.name} ({model.architecture})
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl id="environmentName" isRequired>
                      <FormLabel fontWeight="bold" color="teal.400">Environment</FormLabel>
                      <Select
                        value={formData.environmentName}
                        onChange={(e) => handleInputChange('environmentName', e.target.value)}
                        placeholder="Select an environment..."
                        bg="rgba(0,0,0,0.1)"
                      >
                        {environments.map(env => (
                          <option key={env.id} value={env.id}>
                            {env.name} - {env.description}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl id="architecture">
                      <FormLabel fontWeight="bold" color="teal.400">Algorithm</FormLabel>
                      <Select
                        value={formData.parameters.architecture}
                        onChange={(e) => handleInputChange('parameters.architecture', e.target.value)}
                        bg="rgba(0,0,0,0.1)"
                      >
                        {algorithms.map(alg => (
                          <option key={alg.id} value={alg.id}>
                            {alg.name} - {alg.description}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl id="trainingCost">
                      <FormLabel fontWeight="bold" color="teal.400">Resource Cost</FormLabel>
                      <Input
                        value={trainingCost + ' Credits Required'}
                        isDisabled
                        bg="rgba(0,0,0,0.1)"
                        color="teal.200"
                        fontWeight="bold"
                      />
                    </FormControl>
                  </Grid>

                  {/* Parameters */}
                  <Box mt={6}>
                    <Heading as="h4" size="md" mb={6} color="teal.300">Training Parameters</Heading>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                      <FormControl id="timesteps">
                        <FormLabel>Training Timesteps</FormLabel>
                        <Input
                          type="number"
                          min="1000"
                          max="100000"
                          step="1000"
                          value={formData.parameters.timesteps}
                          onChange={(e) => handleInputChange('parameters.timesteps', parseInt(e.target.value))}
                          bg="rgba(0,0,0,0.1)"
                        />
                      </FormControl>

                      <FormControl id="learningRate">
                        <FormLabel>Learning Rate</FormLabel>
                        <Input
                          type="number"
                          step="0.0001"
                          min="0.0001"
                          max="0.1"
                          value={formData.parameters.learningRate}
                          onChange={(e) => handleInputChange('parameters.learningRate', parseFloat(e.target.value))}
                          bg="rgba(0,0,0,0.1)"
                        />
                      </FormControl>
                    </Grid>
                  </Box>

                  <Flex justify="flex-end" pt={4}>
                    <Button
                      type="submit"
                      size="lg"
                      leftIcon={<FiPlay />}
                      isLoading={isLoading}
                      loadingText="Starting RL Training..."
                      px={12}
                      borderRadius="full"
                      bgGradient="linear(to-r, purple.400, pink.500)"
                      _hover={{ bgGradient: 'linear(to-r, purple.500, pink.600)', transform: 'translateY(-2px)' }}
                      boxShadow="0 4px 15px rgba(147, 51, 234, 0.3)"
                      isDisabled={hasActiveTraining}
                    >
                      {hasActiveTraining ? 'Queue Full - Wait for Active Training' : 'Start RL Training'}
                    </Button>
                  </Flex>
                </VStack>
              </form>
            </Box>
          </motion.div>

          {/* Environment Information */}
          {formData.environmentName && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Box className="glass" p={6}>
                <Flex align="center" mb={4}>
                  <Icon as={FiTarget} w={6} h={6} color="purple.400" mr={3} />
                  <Heading as="h3" size="md" color="purple.300">
                    {environments.find(env => env.id === formData.environmentName)?.name}
                  </Heading>
                </Flex>
                <Text color="gray.300" mb={4}>
                  {environments.find(env => env.id === formData.environmentName)?.description}
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Environment ID: {formData.environmentName}
                </Text>
              </Box>
            </motion.div>
          )}
        </VStack>
      </Box>
    </Box>
  );
}
