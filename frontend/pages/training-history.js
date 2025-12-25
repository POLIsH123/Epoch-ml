import { Box, Heading, Text, Button, VStack, Container, Card, CardHeader, CardBody, Flex, Icon, useColorModeValue, useToast, Grid, Stat, StatLabel, StatNumber, StatHelpText, StatGroup, Badge } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiClock, FiBarChart2, FiZap, FiDatabase, FiPlay, FiPause, FiTrash2, FiDownload, FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

export default function TrainingHistory() {
  const [user, setUser] = useState(null);
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
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
    .then(data => {
      if (data) {
        setUser(data);
        // Load mock training sessions
        loadTrainingSessions();
        setLoading(false);
      }
    })
    .catch(err => {
      console.error('Error fetching user data:', err);
      localStorage.removeItem('token');
      router.push('/login');
    });
  }, [router]);
  
  const loadTrainingSessions = () => {
    // Mock data for training sessions
    setTrainingSessions([
      {
        id: '1',
        modelName: 'Sentiment Analysis RNN',
        modelType: 'RNN',
        status: 'completed',
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(Date.now() - 1800000),
        accuracy: 0.87,
        loss: 0.32,
        dataset: 'IMDB Reviews'
      },
      {
        id: '2',
        modelName: 'Image Classifier CNN',
        modelType: 'CNN',
        status: 'completed',
        startTime: new Date(Date.now() - 86400000),
        endTime: new Date(Date.now() - 72000000),
        accuracy: 0.94,
        loss: 0.18,
        dataset: 'MNIST Digits'
      },
      {
        id: '3',
        modelName: 'Text Generator GPT',
        modelType: 'GPT',
        status: 'running',
        startTime: new Date(),
        endTime: null,
        accuracy: 0.0,
        loss: 1.2,
        dataset: 'Custom Text'
      },
      {
        id: '4',
        modelName: 'CartPole RL Agent',
        modelType: 'Reinforcement Learning',
        status: 'failed',
        startTime: new Date(Date.now() - 172800000),
        endTime: new Date(Date.now() - 158400000),
        accuracy: 0.0,
        loss: 0.0,
        dataset: 'CartPole-v1 Environment'
      }
    ]);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'running': return 'blue';
      case 'failed': return 'red';
      case 'queued': return 'yellow';
      default: return 'gray';
    }
  };
  
  const handleDeleteSession = (id) => {
    setTrainingSessions(prev => prev.filter(session => session.id !== id));
    toast({
      title: 'Session deleted',
      description: 'The training session has been removed from history',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const handleDownloadModel = (id) => {
    toast({
      title: 'Download started',
      description: 'The trained model is being prepared for download',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
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
                <Heading as="h1" size="lg">Training History</Heading>
                <Text color="gray.500">Review your completed and ongoing training sessions</Text>
              </VStack>
              <Flex align="center" gap={4}>
                <Box p={3} bg="teal.100" borderRadius="md">
                  <Flex align="center" gap={2}>
                    <Icon as={FiClock} color="teal.500" />
                    <Text fontWeight="bold">{trainingSessions.length} sessions</Text>
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
                <StatLabel>Completed</StatLabel>
                <StatNumber>{trainingSessions.filter(s => s.status === 'completed').length}</StatNumber>
                <StatHelpText>Sessions successfully finished</StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Running</StatLabel>
                <StatNumber>{trainingSessions.filter(s => s.status === 'running').length}</StatNumber>
                <StatHelpText>Sessions currently active</StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Failed</StatLabel>
                <StatNumber>{trainingSessions.filter(s => s.status === 'failed').length}</StatNumber>
                <StatHelpText>Sessions with errors</StatHelpText>
              </Stat>
            </StatGroup>
          </motion.div>
          
          {/* Training Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card bg={cardBg}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiBarChart2} w={6} h={6} color="teal.500" mr={3} />
                  <Heading as="h3" size="md">Training Sessions</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                {trainingSessions.length > 0 ? (
                  <Grid templateColumns={{ base: '1fr' }} gap={4}>
                    {trainingSessions.map(session => (
                      <Card key={session.id} bg={useColorModeValue('gray.50', 'gray.700')}>
                        <CardBody>
                          <Flex justify="space-between" align="start">
                            <VStack align="start" spacing={2} flex={1}>
                              <Flex align="center" gap={3}>
                                <Heading as="h4" size="sm">{session.modelName}</Heading>
                                <Badge colorScheme={getStatusColor(session.status)}>
                                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                </Badge>
                                <Text fontSize="sm" bg="gray.200" px={2} py={1} borderRadius="md">
                                  {session.modelType}
                                </Text>
                              </Flex>
                              <Text fontSize="sm" color="gray.500">{session.dataset}</Text>
                              
                              <Flex gap={6} mt={2}>
                                <VStack align="start" spacing={1}>
                                  <Text fontSize="xs" fontWeight="bold">Start Time</Text>
                                  <Text fontSize="xs">
                                    {session.startTime.toLocaleString()}
                                  </Text>
                                </VStack>
                                
                                <VStack align="start" spacing={1}>
                                  <Text fontSize="xs" fontWeight="bold">End Time</Text>
                                  <Text fontSize="xs">
                                    {session.endTime ? session.endTime.toLocaleString() : 'N/A'}
                                  </Text>
                                </VStack>
                                
                                {session.accuracy > 0 && (
                                  <VStack align="start" spacing={1}>
                                    <Text fontSize="xs" fontWeight="bold">Accuracy</Text>
                                    <Text fontSize="xs">{(session.accuracy * 100).toFixed(2)}%</Text>
                                  </VStack>
                                )}
                                
                                {session.loss > 0 && (
                                  <VStack align="start" spacing={1}>
                                    <Text fontSize="xs" fontWeight="bold">Loss</Text>
                                    <Text fontSize="xs">{session.loss.toFixed(4)}</Text>
                                  </VStack>
                                )}
                              </Flex>
                            </VStack>
                            
                            <Flex gap={2} direction="column">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                colorScheme="teal"
                                leftIcon={<FiInfo />}
                                onClick={() => {
                                  toast({
                                    title: `${session.modelName} Details`,
                                    description: `Status: ${session.status}\nType: ${session.modelType}\nDataset: ${session.dataset}`,
                                    status: 'info',
                                    duration: 5000,
                                    isClosable: true,
                                  });
                                }}
                              >
                                Details
                              </Button>
                              
                              {session.status === 'completed' && (
                                <Button 
                                  size="sm" 
                                  colorScheme="teal"
                                  leftIcon={<FiDownload />}
                                  onClick={() => handleDownloadModel(session.id)}
                                >
                                  Download
                                </Button>
                              )}
                              
                              {session.status === 'running' && (
                                <Button 
                                  size="sm" 
                                  colorScheme="red"
                                  leftIcon={<FiPause />}
                                >
                                  Stop
                                </Button>
                              )}
                              
                              <Button 
                                size="sm" 
                                variant="outline" 
                                colorScheme="red"
                                leftIcon={<FiTrash2 />}
                                onClick={() => handleDeleteSession(session.id)}
                              >
                                Delete
                              </Button>
                            </Flex>
                          </Flex>
                        </CardBody>
                      </Card>
                    ))}
                  </Grid>
                ) : (
                  <Flex justify="center" align="center" py={12} color="gray.500">
                    <VStack spacing={4}>
                      <Icon as={FiClock} w={16} h={16} />
                      <Heading as="h3" size="md">No training history</Heading>
                      <Text>Start your first training session to see results here</Text>
                      <Button 
                        colorScheme="teal" 
                        leftIcon={<FiZap />}
                        onClick={() => router.push('/train')}
                      >
                        Start Training
                      </Button>
                    </VStack>
                  </Flex>
                )}
              </CardBody>
            </Card>
          </motion.div>
        </VStack>
      </Box>
    </Box>
  );
}