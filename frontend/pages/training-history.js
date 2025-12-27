import { Box, Heading, Text, Button, VStack, Container, Grid, Card, CardHeader, CardBody, Flex, Icon, useColorModeValue, useToast, Spinner, Badge } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiBarChart2, FiClock, FiCheckCircle, FiXCircle, FiAlertTriangle, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

export default function TrainingHistory() {
  const [sessions, setSessions] = useState([]);
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

          // Get training history
          return fetch('http://localhost:5001/api/training', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        }
      })
      .then(res => res.json())
      .then(data => {
        setSessions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching training history:', err);
        localStorage.removeItem('token');
        router.push('/login');
      });
  }, [router]);

  const handleDeleteSession = async (sessionId, sessionName) => {
    try {
      const response = await fetch(`http://localhost:5001/api/training/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Remove the session from the local state
        setSessions(prev => prev.filter(session => session.id !== sessionId));

        toast({
          title: 'Session deleted',
          description: `Training session "${sessionName}" has been deleted successfully`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Delete failed',
          description: data.error || 'Could not delete training session',
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'running':
        return 'blue';
      case 'failed':
        return 'red';
      case 'queued':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return FiCheckCircle;
      case 'running':
        return FiClock;
      case 'failed':
        return FiXCircle;
      case 'queued':
        return FiAlertTriangle;
      default:
        return FiClock;
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
                <Heading as="h1" size="lg">Training History</Heading>
                <Text color="gray.500">View and manage your model training sessions</Text>
              </VStack>
              <Flex align="center" gap={4}>
                <Box p={3} bg="teal.100" borderRadius="md">
                  <Flex align="center" gap={2}>
                    <Icon as={FiBarChart2} color="teal.500" />
                    <Text fontWeight="bold">{sessions.length} sessions</Text>
                  </Flex>
                </Box>
              </Flex>
            </Flex>
          </motion.div>

          {/* Training Sessions Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {sessions.length === 0 ? (
              <Card bg={cardBg} textAlign="center" py={12}>
                <VStack spacing={4}>
                  <Icon as={FiBarChart2} w={16} h={16} color="gray.400" />
                  <Heading as="h2" size="md">No training sessions yet</Heading>
                  <Text color="gray.500">You haven't started any model training sessions yet</Text>
                  <Button
                    colorScheme="teal"
                    onClick={() => router.push('/train')}
                    size="lg"
                  >
                    Start Training
                  </Button>
                </VStack>
              </Card>
            ) : (
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
                {sessions.map(session => {
                  const StatusIcon = getStatusIcon(session.status);

                  return (
                    <motion.div
                      key={session.id}
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card bg={cardBg} h="full">
                        <CardHeader>
                          <Flex justify="space-between" align="center">
                            <Flex align="center" gap={3}>
                              <Icon as={StatusIcon} color={`${getStatusColor(session.status)}.500`} />
                              <Heading as="h3" size="md">{session.modelName || 'Unknown Model'}</Heading>
                            </Flex>
                            <Badge colorScheme={getStatusColor(session.status)}>
                              {session.status}
                            </Badge>
                          </Flex>
                        </CardHeader>
                        <CardBody>
                          <VStack align="start" spacing={3}>
                            <Text><strong>Model:</strong> {session.modelType || 'Unknown'}</Text>
                            <Text><strong>Dataset:</strong> {session.datasetId || 'Unknown'}</Text>
                            <Text><strong>Status:</strong> {session.status}</Text>
                            <Text><strong>Cost:</strong> {session.cost} credits</Text>
                            <Text><strong>Start Time:</strong> {new Date(session.startTime).toLocaleString()}</Text>

                            {session.endTime && (
                              <Text><strong>End Time:</strong> {new Date(session.endTime).toLocaleString()}</Text>
                            )}

                            {session.accuracy !== undefined && (
                              <Flex align="center" gap={2}>
                                <Text>
                                  <strong>{
                                    session.metricName || (['dataset-9', 'dataset-13'].includes(session.datasetId) ? 'MAE' : 'Accuracy')
                                  }:</strong> {
                                    (session.metricName === 'MAE' || session.accuracy > 1.1 || ['dataset-9', 'dataset-13'].includes(session.datasetId))
                                      ? session.accuracy.toFixed(4)
                                      : (session.accuracy * 100).toFixed(2) + '%'
                                  }
                                </Text>
                                {session.accuracyPercent !== undefined && (
                                  <Badge colorScheme="green">{session.accuracyPercent.toFixed(1)}% Acc</Badge>
                                )}
                              </Flex>
                            )}

                            {session.loss !== undefined && (
                              <Flex align="center" gap={2}>
                                <Text><strong>Loss:</strong> {session.loss.toFixed(4)}</Text>
                                {session.lossPercent !== undefined && (
                                  <Badge colorScheme="orange">{session.lossPercent.toFixed(1)}% Loss</Badge>
                                )}
                              </Flex>
                            )}

                            {session.totalEpochs > 0 && (
                              <Flex align="center" gap={2}>
                                <Text><strong>Epoch Progress:</strong></Text>
                                <Badge colorScheme="blue">
                                  {session.currentEpoch} / {session.totalEpochs}
                                </Badge>
                              </Flex>
                            )}

                            <Flex justify="space-between" align="center" width="100%" mt={4}>
                              <Button
                                variant="outline"
                                colorScheme="red"
                                leftIcon={<FiTrash2 />}
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete this training session? This action cannot be undone.`)) {
                                    handleDeleteSession(session.id, session.modelName || 'Unknown Model');
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
                  );
                })}
              </Grid>
            )}
          </motion.div>
        </VStack>
      </Box>
    </Box>
  );
}