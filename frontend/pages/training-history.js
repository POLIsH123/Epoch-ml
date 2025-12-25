import { Box, Heading, Text, Button, VStack, Container, Card, CardHeader, CardBody, Flex, Icon, useColorModeValue, useToast, Spinner, Badge } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiClock, FiActivity, FiCheckCircle, FiXCircle, FiRefreshCw, FiBarChart2 } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function TrainingHistory() {
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
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
    .then(userData => {
      if (userData) {
        setUser(userData);
        
        // Get training history
        return fetch('http://localhost:4000/api/training', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    })
    .then(res => res.json())
    .then(data => {
      setTrainingSessions(data);
      setLoading(false);
    })
    .catch(err => {
      console.error('Error fetching data:', err);
      localStorage.removeItem('token');
      router.push('/login');
    });
  }, [router]);
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <Icon as={FiCheckCircle} color="green.500" />;
      case 'failed':
        return <Icon as={FiXCircle} color="red.500" />;
      case 'running':
        return <Icon as={FiActivity} color="blue.500" />;
      case 'pending':
        return <Icon as={FiClock} color="yellow.500" />;
      default:
        return <Icon as={FiClock} color="gray.500" />;
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      case 'running':
        return 'blue';
      case 'pending':
        return 'yellow';
      default:
        return 'gray';
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
                <Heading as="h1" size="lg">Training History</Heading>
                <Text color="gray.500">View your model training sessions</Text>
              </VStack>
              <Flex align="center" gap={4}>
                <Box p={3} bg="teal.100" borderRadius="md">
                  <Flex align="center" gap={2}>
                    <Icon as={FiBarChart2} color="teal.500" />
                    <Text fontWeight="bold">{trainingSessions.length} sessions</Text>
                  </Flex>
                </Box>
              </Flex>
            </Flex>
          </motion.div>
          
          {/* Training Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {trainingSessions.length === 0 ? (
              <Card bg={cardBg} textAlign="center" py={12}>
                <VStack spacing={4}>
                  <Icon as={FiClock} w={16} h={16} color="gray.400" />
                  <Heading as="h2" size="md">No training sessions yet</Heading>
                  <Text color="gray.500">Start training your first model to see it here</Text>
                  <Button 
                    colorScheme="teal" 
                    onClick={() => router.push('/train')}
                    leftIcon={<FiBarChart2 />}
                  >
                    Start Training
                  </Button>
                </VStack>
              </Card>
            ) : (
              <VStack spacing={4} align="stretch">
                {trainingSessions.map(session => (
                  <motion.div
                    key={session._id}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card bg={cardBg}>
                      <CardBody>
                        <Flex justify="space-between" align="center">
                          <Flex align="center" gap={4}>
                            {getStatusIcon(session.status)}
                            <VStack align="start" spacing={1}>
                              <Heading as="h3" size="sm">Model Training Session</Heading>
                              <Text color="gray.500" fontSize="sm">ID: {session._id}</Text>
                              <Flex gap={2} mt={1}>
                                <Badge colorScheme={getStatusColor(session.status)}>
                                  {session.status}
                                </Badge>
                                <Badge colorScheme="teal">
                                  {session.progress}%
                                </Badge>
                              </Flex>
                            </VStack>
                          </Flex>
                          
                          <Flex align="center" gap={4}>
                            <VStack align="end" spacing={1}>
                              <Text fontSize="sm">Started: {new Date(session.startedAt).toLocaleString()}</Text>
                              {session.completedAt && (
                                <Text fontSize="sm">Completed: {new Date(session.completedAt).toLocaleString()}</Text>
                              )}
                            </VStack>
                            <Button 
                              variant="outline" 
                              colorScheme="teal"
                              size="sm"
                              onClick={() => {
                                // Refresh the session data
                                const token = localStorage.getItem('token');
                                fetch(`http://localhost:4000/api/training/${session._id}`, {
                                  headers: {
                                    'Authorization': `Bearer ${token}`
                                  }
                                })
                                .then(res => res.json())
                                .then(data => {
                                  // Update the session in the list
                                  setTrainingSessions(prev => 
                                    prev.map(s => s._id === session._id ? data : s)
                                  );
                                  toast({
                                    title: 'Session updated',
                                    description: 'Training session data refreshed',
                                    status: 'success',
                                    duration: 2000,
                                    isClosable: true,
                                  });
                                })
                                .catch(err => {
                                  toast({
                                    title: 'Error',
                                    description: 'Could not refresh session data',
                                    status: 'error',
                                    duration: 2000,
                                    isClosable: true,
                                  });
                                });
                              }}
                            >
                              <Icon as={FiRefreshCw} />
                            </Button>
                          </Flex>
                        </Flex>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </VStack>
            )}
          </motion.div>
        </VStack>
      </Container>
    </Box>
  );
}