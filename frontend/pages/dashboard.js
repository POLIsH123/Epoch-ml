import { Box, Heading, Text, Button, VStack, Container, Grid, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatGroup, Card, CardHeader, CardBody, Flex, Icon, useColorModeValue, Spinner, Alert, AlertIcon, useToast } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiCpu, FiBarChart2, FiZap, FiDollarSign, FiDatabase, FiUsers, FiActivity, FiTrendingUp, FiClock, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    
    // Verify token is valid by making a simple API call
    fetch('http://localhost:4000/api/auth/profile', {
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
    .then(data => {
      if (data) {
        setUser(data);
        setLoading(false);
      }
    })
    .catch(err => {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data. Please try logging in again.');
      localStorage.removeItem('token');
      router.push('/login');
    });
  }, [router]);
  
  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={bg}>
        <Spinner size="xl" />
      </Flex>
    );
  }
  
  if (error) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg={bg}>
        <Alert status="error" maxW="container.md">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box minH="100vh" bg={bg} py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Flex justify="space-between" align="center" mb={6}>
              <VStack align="start" spacing={2}>
                <Heading as="h1" size="lg">Welcome back, {user?.username}!</Heading>
                <Text color="gray.500">Ready to build the next breakthrough model?</Text>
              </VStack>
              <Flex align="center" gap={4}>
                <Box p={3} bg="teal.100" borderRadius="md">
                  <Flex align="center" gap={2}>
                    <Icon as={FiDollarSign} color="teal.500" />
                    <Text fontWeight="bold">{user?.credits || 100} credits</Text>
                  </Flex>
                </Box>
                <Box p={3} bg="blue.100" borderRadius="md">
                  <Flex align="center" gap={2}>
                    <Icon as={FiActivity} color="blue.500" />
                    <Text fontWeight="bold">Active</Text>
                  </Flex>
                </Box>
              </Flex>
            </Flex>
          </motion.div>
          
          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StatGroup>
              <Stat>
                <StatLabel>Account</StatLabel>
                <StatNumber>{user?.username}</StatNumber>
                <StatHelpText>Your account</StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Credits</StatLabel>
                <StatNumber>{user?.credits || 100}</StatNumber>
                <StatHelpText>Available for training</StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Models</StatLabel>
                <StatNumber>12</StatNumber>
                <StatHelpText>Available for training</StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Trained</StatLabel>
                <StatNumber>5</StatNumber>
                <StatHelpText>This month</StatHelpText>
              </Stat>
            </StatGroup>
          </motion.div>
          
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card bg={cardBg}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiZap} w={6} h={6} color="teal.500" mr={3} />
                  <Heading as="h3" size="md">Quick Actions</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <Button 
                    colorScheme="teal" 
                    onClick={() => router.push('/train')}
                    leftIcon={<FiCpu />}
                    size="lg"
                  >
                    Train New Model
                  </Button>
                  <Button 
                    variant="outline" 
                    colorScheme="teal" 
                    onClick={() => router.push('/models')}
                    leftIcon={<FiBarChart2 />}
                    size="lg"
                  >
                    Browse Models
                  </Button>
                  <Button 
                    variant="outline" 
                    colorScheme="teal" 
                    onClick={() => router.push('/training-history')}
                    leftIcon={<FiClock />}
                    size="lg"
                  >
                    Training History
                  </Button>
                </SimpleGrid>
              </CardBody>
            </Card>
          </motion.div>
          
          {/* Model Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card bg={cardBg}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiDatabase} w={6} h={6} color="blue.500" mr={3} />
                  <Heading as="h3" size="md">Supported Model Types</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                  <Flex align="center" gap={3}>
                    <Icon as={FiCheckCircle} color="green.500" />
                    <Text>RNN, LSTM, GRU</Text>
                  </Flex>
                  <Flex align="center" gap={3}>
                    <Icon as={FiCheckCircle} color="green.500" />
                    <Text>CNN, ResNet, Inception</Text>
                  </Flex>
                  <Flex align="center" gap={3}>
                    <Icon as={FiCheckCircle} color="green.500" />
                    <Text>GPT, BERT, T5 Transformers</Text>
                  </Flex>
                  <Flex align="center" gap={3}>
                    <Icon as={FiCheckCircle} color="green.500" />
                    <Text>DQN, PPO, A2C, SAC, TD3 (RL)</Text>
                  </Flex>
                </Grid>
              </CardBody>
            </Card>
          </motion.div>
          
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card bg={cardBg}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiUsers} w={6} h={6} color="purple.500" mr={3} />
                  <Heading as="h3" size="md">Recent Activity</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Flex justify="space-between" p={3} bg="gray.100" borderRadius="md">
                    <Text>Completed GPT model training</Text>
                    <Text color="gray.500" fontSize="sm">2 hours ago</Text>
                  </Flex>
                  <Flex justify="space-between" p={3} bg="gray.100" borderRadius="md">
                    <Text>Started CNN model training</Text>
                    <Text color="gray.500" fontSize="sm">5 hours ago</Text>
                  </Flex>
                  <Flex justify="space-between" p={3} bg="gray.100" borderRadius="md">
                    <Text>Created new RNN model</Text>
                    <Text color="gray.500" fontSize="sm">1 day ago</Text>
                  </Flex>
                </VStack>
              </CardBody>
            </Card>
          </motion.div>
        </VStack>
      </Container>
    </Box>
  );
}