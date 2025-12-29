import { Box, Heading, Text, Button, VStack, Container, Card, CardBody, Flex, Icon, useColorModeValue, useToast, Spinner } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiArrowLeft, FiBarChart2, FiClock, FiCheckCircle, FiXCircle, FiAlertTriangle, FiCpu, FiDatabase } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Sidebar from '../../../components/Sidebar';

export default function TrainingSessionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const toast = useToast();

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Verify token and get user profile
    Promise.all([
      fetch('http://localhost:5001/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(res => res.json()),

      fetch(`http://localhost:5001/api/training/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(res => res.json())
    ])
      .then(([userData, sessionData]) => {
        if (userData) {
          setUser(userData);
        }
        setSession(sessionData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching session details:', err);
        localStorage.removeItem('token');
        router.push('/login');
      });
  }, [id, router]);

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

  if (!session) {
    return (
      <Box minH="100vh" bg={bg}>
        <Sidebar user={user} />
        <Box ml="250px" p={8}>
          <VStack spacing={8} align="center" justify="center" h="70vh">
            <Icon as={FiAlertTriangle} w={16} h={16} color="gray.500" />
            <Text color="gray.500" fontSize="lg">Training session not found</Text>
            <Button
              leftIcon={<FiArrowLeft />}
              onClick={() => router.push('/training-history')}
              colorScheme="teal"
              borderRadius="full"
              px={8}
            >
              Back to History
            </Button>
          </VStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bg}>
      <Sidebar user={user} />
      <Box ml="250px" p={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Flex justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Button
                  leftIcon={<FiArrowLeft />}
                  onClick={() => router.push('/training-history')}
                  variant="ghost"
                  colorScheme="teal"
                  size="sm"
                  mb={4}
                >
                  Back to History
                </Button>
                <Heading as="h1" size="xl" bgGradient="linear(to-r, teal.300, blue.400)" bgClip="text">
                  Session Details
                </Heading>
                <Text color="gray.500" fontSize="lg">Detailed metrics for your neural training session.</Text>
              </VStack>
              <Box className="glass" px={6} py={3}>
                <Flex align="center" gap={3}>
                  <Icon as={getStatusIcon(session.status)} color={`${getStatusColor(session.status)}.400`} />
                  <Text fontWeight="bold" color="gray.200" textTransform="uppercase">{session.status}</Text>
                </Flex>
              </Box>
            </Flex>
          </motion.div>

          {/* Session Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="glass" bg={cardBg}>
              <CardBody>
                <VStack align="stretch" spacing={6}>
                  <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                      <Heading size="md" color="teal.300">{session.modelName}</Heading>
                      <Text color="gray.500">{session.modelType}</Text>
                    </VStack>
                    <Icon as={FiCpu} w={10} h={10} color="teal.400" />
                  </Flex>

                  <Flex justify="space-between" align="center" p={4} bg="rgba(0,0,0,0.2)" borderRadius="md">
                    <VStack align="start" spacing={1}>
                      <Text fontSize="xs" color="gray.500">DATASET</Text>
                      <Text fontWeight="bold">{session.datasetId || 'N/A'}</Text>
                    </VStack>
                    <Icon as={FiDatabase} w={6} h={6} color="blue.400" />
                  </Flex>

                  <Flex justify="space-between" align="center" p={4} bg="rgba(0,0,0,0.2)" borderRadius="md">
                    <VStack align="start" spacing={1}>
                      <Text fontSize="xs" color="gray.500">START TIME</Text>
                      <Text fontWeight="bold">{new Date(session.startTime).toLocaleString()}</Text>
                    </VStack>
                    <Icon as={FiClock} w={6} h={6} color="yellow.400" />
                  </Flex>

                  {session.endTime && (
                    <Flex justify="space-between" align="center" p={4} bg="rgba(0,0,0,0.2)" borderRadius="md">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="xs" color="gray.500">END TIME</Text>
                        <Text fontWeight="bold">{new Date(session.endTime).toLocaleString()}</Text>
                      </VStack>
                      <Icon as={FiClock} w={6} h={6} color="green.400" />
                    </Flex>
                  )}

                  {session.metrics && (
                    <Flex justify="space-between" align="center" p={4} bg="rgba(0,0,0,0.2)" borderRadius="md">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="xs" color="gray.500">ACCURACY</Text>
                        <Text fontWeight="bold">{(session.metrics.accuracy * 100).toFixed(2)}%</Text>
                      </VStack>
                      <Icon as={FiBarChart2} w={6} h={6} color="green.400" />
                    </Flex>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </motion.div>

          {/* Training Metrics */}
          {session.metrics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="glass" bg={cardBg}>
                <CardBody>
                  <Heading size="md" color="blue.400" mb={6}>Training Metrics</Heading>
                  <VStack align="stretch" spacing={4}>
                    <Flex justify="space-between" p={4} bg="rgba(0,0,0,0.2)" borderRadius="md">
                      <Text fontSize="sm" color="gray.400">Final Loss</Text>
                      <Text fontWeight="bold">{session.metrics.loss ? session.metrics.loss.toFixed(6) : 'N/A'}</Text>
                    </Flex>
                    <Flex justify="space-between" p={4} bg="rgba(0,0,0,0.2)" borderRadius="md">
                      <Text fontSize="sm" color="gray.400">Final Accuracy</Text>
                      <Text fontWeight="bold">{session.metrics.accuracy ? (session.metrics.accuracy * 100).toFixed(2) + '%' : 'N/A'}</Text>
                    </Flex>
                    <Flex justify="space-between" p={4} bg="rgba(0,0,0,0.2)" borderRadius="md">
                      <Text fontSize="sm" color="gray.400">Training Time</Text>
                      <Text fontWeight="bold">{session.metrics.trainingTime || 'N/A'}</Text>
                    </Flex>
                    <Flex justify="space-between" p={4} bg="rgba(0,0,0,0.2)" borderRadius="md">
                      <Text fontSize="sm" color="gray.400">Epochs Completed</Text>
                      <Text fontWeight="bold">{session.metrics.epochsCompleted || 'N/A'}</Text>
                    </Flex>
                  </VStack>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Flex gap={4}>
              <Button
                leftIcon={<FiBarChart2 />}
                onClick={() => router.push('/models')}
                colorScheme="teal"
                variant="outline"
                borderRadius="full"
                flex={1}
              >
                View Model
              </Button>
              <Button
                leftIcon={<FiCpu />}
                onClick={() => router.push('/train')}
                colorScheme="blue"
                variant="outline"
                borderRadius="full"
                flex={1}
              >
                New Training
              </Button>
            </Flex>
          </motion.div>
        </VStack>
      </Box>
    </Box>
  );
}