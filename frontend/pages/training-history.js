import { Box, Heading, Text, Button, VStack, Container, Grid, Card, CardHeader, CardBody, Flex, Icon, useColorModeValue, useToast, Spinner, Badge, HStack } from '@chakra-ui/react';
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
        console.log('Training history data:', data);
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
                  Neural History
                </Heading>
                <Text color="gray.500" fontSize="lg">Review and manage past training architectures.</Text>
              </VStack>
              <Box className="glass" px={6} py={3}>
                <HStack spacing={3}>
                  <Icon as={FiClock} color="teal.400" />
                  <Text fontWeight="bold" color="gray.200">{sessions.length} RECORDED SESSIONS</Text>
                </HStack>
              </Box>
            </Flex>
          </motion.div>

          {/* History List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Box className="glass" p={0} overflow="hidden">
              {sessions.length === 0 ? (
                <Flex direction="column" align="center" justify="center" p={20}>
                  <Icon as={FiAlertTriangle} w={12} h={12} color="gray.600" mb={4} />
                  <Text color="gray.500" fontSize="lg">No neural logs found in the archives.</Text>
                  <Button
                    mt={6}
                    colorScheme="teal"
                    onClick={() => router.push('/train')}
                    borderRadius="full"
                    px={8}
                  >
                    Initiate First Session
                  </Button>
                </Flex>
              ) : (
                <VStack align="stretch" spacing={0}>
                  <Grid
                    templateColumns="2fr 1fr 1fr 1fr 1fr 1fr auto"
                    gap={6}
                    p={6}
                    bg="rgba(255,255,255,0.02)"
                    borderBottom="1px solid"
                    borderColor="whiteAlpha.100"
                    fontWeight="bold"
                    color="teal.300"
                    fontSize="xs"
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    <Text>Architecture</Text>
                    <Text>Status</Text>
                    <Text>Loss %</Text>
                    <Text>Accuracy %</Text>
                    <Text>Epochs</Text>
                    <Text>Time</Text>
                    <Text textAlign="center">Actions</Text>
                  </Grid>
                  {sessions.map((session, index) => (
                    <Grid
                      key={session.id || session._id}
                      templateColumns="2fr 1fr 1fr 1fr 1fr 1fr auto"
                      gap={6}
                      p={6}
                      borderBottom={index === sessions.length - 1 ? "none" : "1px solid"}
                      borderColor="whiteAlpha.100"
                      alignItems="center"
                      _hover={{ bg: 'rgba(255,255,255,0.02)' }}
                      transition="background 0.2s"
                    >
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" color="gray.100">{session.modelName}</Text>
                        <Text fontSize="xs" color="gray.500">{session.modelType || 'Neural Core'}</Text>
                      </VStack>
                      <Box>
                        <Badge
                          colorScheme={session.status === 'completed' ? 'green' : session.status === 'failed' ? 'red' : session.status === 'running' ? 'blue' : 'yellow'}
                          variant="subtle"
                          px={3}
                          borderRadius="full"
                          fontSize="xs"
                        >
                          {session.status.toUpperCase()}
                        </Badge>
                      </Box>
                      <Text fontSize="sm" color="gray.400">
                        {session.metrics && session.metrics.lossPercent ? session.metrics.lossPercent.toFixed(2) + '%' : 'N/A'}
                      </Text>
                      <Text fontSize="sm" color="gray.400">
                        {session.metrics && session.metrics.accuracyPercent ? session.metrics.accuracyPercent.toFixed(2) + '%' : 'N/A'}
                      </Text>
                      <Text fontSize="sm" color="gray.400">
                        {/* Ensemble models don't use epochs, show N/A for them */}
                        {session.modelType === 'ENSEMBLE' || ['Random Forest', 'Gradient Boosting', 'XGBoost', 'LightGBM'].includes(session.modelType) 
                          ? 'N/A' 
                          : `${session.metrics && session.metrics.epochsCompleted ? session.metrics.epochsCompleted : '0'} / ${session.metrics && session.metrics.totalEpochs ? session.metrics.totalEpochs : (session.params && session.params.epochs ? session.params.epochs : 'N/A')}`
                        }
                      </Text>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="gray.500">
                          {new Date(session.startTime).toLocaleDateString()}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {new Date(session.startTime).toLocaleTimeString()}
                        </Text>
                      </VStack>
                      <Flex gap={2} justify="center">
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          leftIcon={<FiBarChart2 />}
                          onClick={() => router.push(`/training-history/${session.id || session._id}`)}
                          borderRadius="full"
                        >
                          Details
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          leftIcon={<FiTrash2 />}
                          onClick={() => handleDeleteSession(session.id || session._id, session.modelName)}
                          borderRadius="full"
                        >
                          Purge
                        </Button>
                      </Flex>
                    </Grid>
                  ))}
                </VStack>
              )}
            </Box>
          </motion.div>
        </VStack>
      </Box>
    </Box>
  );
}