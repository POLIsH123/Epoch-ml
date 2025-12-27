import { Box, Heading, Text, Button, VStack, Container, Grid, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatGroup, Card, CardHeader, CardBody, Flex, Icon, useColorModeValue, Spinner, Alert, useToast, Badge } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiCpu, FiBarChart2, FiZap, FiDollarSign, FiDatabase, FiUsers, FiActivity, FiTrendingUp, FiClock, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    successRate: 0,
    totalCreditsSpent: 0,
    activityTrend: 0,
    activeNodes: 1204,
    latency: 42
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

    // Verify token and fetch data
    const fetchData = async () => {
      try {
        const profileRes = await fetch('http://localhost:5001/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (profileRes.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        const userData = await profileRes.json();
        setUser(userData);

        // Fetch other data in parallel
        const [trainingRes, statsRes] = await Promise.all([
          fetch('http://localhost:5001/api/training', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:5001/api/training/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (trainingRes.ok) {
          const sessions = await trainingRes.json();
          if (sessions && sessions.length > 0) {
            const sorted = sessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
            setRecentActivity(sorted.slice(0, 3).map(s => ({
              action: `Trained ${s.modelName} on ${s.datasetId}`,
              time: new Date(s.startTime).toLocaleTimeString()
            })));
          }
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        setLoading(false);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Check your connection to the AI engine.');
        setLoading(false);
      }
    };

    fetchData();
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
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bg}>
      <Sidebar user={user} />
      <Box ml="250px" p={6}>
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
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
              <Card bg={cardBg} borderRadius="xl" borderTop="4px solid" borderTopColor="teal.400">
                <CardBody>
                  <Stat>
                    <StatLabel color="gray.500">Available Credits</StatLabel>
                    <StatNumber fontSize="2xl">{user?.credits || 0}</StatNumber>
                    <StatHelpText>
                      <Icon as={stats.activityTrend >= 0 ? FiTrendingUp : FiActivity} color={stats.activityTrend >= 0 ? "green.500" : "red.500"} />
                      {stats.activityTrend >= 0 ? ` +${stats.activityTrend}%` : ` ${stats.activityTrend}%`} vs Prev 24h
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg={cardBg} borderRadius="xl" borderTop="4px solid" borderTopColor="blue.400">
                <CardBody>
                  <Stat>
                    <StatLabel color="gray.500">Model Success Rate</StatLabel>
                    <StatNumber fontSize="2xl">{stats.successRate}%</StatNumber>
                    <StatHelpText><Icon as={FiCheckCircle} color="blue.500" /> {stats.completedSessions} / {stats.totalSessions} sessions</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg={cardBg} borderRadius="xl" borderTop="4px solid" borderTopColor="purple.400">
                <CardBody>
                  <Stat>
                    <StatLabel color="gray.500">Active Nodes</StatLabel>
                    <StatNumber fontSize="2xl">{stats.activeNodes.toLocaleString()}</StatNumber>
                    <StatHelpText>Global Network Distributed</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg={cardBg} borderRadius="xl" borderTop="4px solid" borderTopColor="orange.400">
                <CardBody>
                  <Stat>
                    <StatLabel color="gray.500">Compute Latency</StatLabel>
                    <StatNumber fontSize="2xl">{stats.latency}ms</StatNumber>
                    <StatHelpText><Icon as={FiZap} color="orange.400" /> Edge Optimized</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>
          </motion.div>

          {/* AI Insights & Recommendation */}
          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card bg={cardBg} h="full">
                <CardHeader>
                  <Flex align="center">
                    <Icon as={FiZap} w={6} h={6} color="orange.400" mr={3} />
                    <Heading as="h3" size="md">Epoch-ML Intelligent Insights</Heading>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Box p={4} bg="orange.50" borderRadius="lg" borderLeft="4px solid" borderLeftColor="orange.400">
                      <Flex align="start" gap={3}>
                        <Icon as={FiInfo} color="orange.400" mt={1} />
                        <Box>
                          <Text fontWeight="bold">Optimization Tip</Text>
                          <Text fontSize="sm">Your recent CNN training could benefit from a higher batch size (64) to utilize GPU nodes more efficiently.</Text>
                        </Box>
                      </Flex>
                    </Box>
                    <Box p={4} bg="blue.50" borderRadius="lg" borderLeft="4px solid" borderLeftColor="blue.400">
                      <Flex align="start" gap={3}>
                        <Icon as={FiCpu} color="blue.400" mt={1} />
                        <Box>
                          <Text fontWeight="bold">Architecture Suggestion</Text>
                          <Text fontSize="sm">Based on the Boston Housing dataset, trying an **XGBoost** model usually yields 12% lower MAE than traditional RNNs.</Text>
                        </Box>
                      </Flex>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card bg={cardBg} h="full">
                <CardHeader>
                  <Flex align="center">
                    <Icon as={FiTrendingUp} w={6} h={6} color="green.400" mr={3} />
                    <Heading as="h3" size="md">Trending</Heading>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="medium" fontSize="sm">GPT-4 Turbo</Text>
                      <Badge colorScheme="green">HOT</Badge>
                    </Flex>
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="medium" fontSize="sm">Stable Diffusion XL</Text>
                      <Badge colorScheme="blue">NEW</Badge>
                    </Flex>
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="medium" fontSize="sm">Llama-3 70B</Text>
                      <Badge colorScheme="purple">POPULAR</Badge>
                    </Flex>
                  </VStack>
                </CardBody>
              </Card>
            </motion.div>
          </Grid>

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
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <Flex key={index} justify="space-between" p={3} bg="gray.100" borderRadius="md">
                        <Text>{activity.action}</Text>
                        <Text color="gray.500" fontSize="sm">{activity.time}</Text>
                      </Flex>
                    ))
                  ) : (
                    <Flex justify="center" p={6} color="gray.500">
                      <Text>No recent activity yet. Start training your first model!</Text>
                    </Flex>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </motion.div>
        </VStack>
      </Box>
    </Box>
  );
}