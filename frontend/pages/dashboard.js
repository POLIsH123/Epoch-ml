import { Box, Heading, Text, Button, VStack, HStack, Container, Grid, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatGroup, Card, CardHeader, CardBody, Flex, Icon, useColorModeValue, Spinner, Alert, useToast, Badge } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiCpu, FiBarChart2, FiZap, FiDollarSign, FiDatabase, FiUsers, FiActivity, FiTrendingUp, FiClock, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Tutorial from '../components/Tutorial';

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
  const [showTutorial, setShowTutorial] = useState(false);
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

        // Check if user is new (no models or training sessions)
        const [modelsRes, trainingRes] = await Promise.all([
          fetch('http://localhost:5001/api/models', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:5001/api/training', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        // Check if any of the responses failed
        if (!modelsRes.ok) {
          console.error('Models API error:', await modelsRes.text());
          throw new Error('Models API failed');
        }
        
        if (!trainingRes.ok) {
          console.error('Training API error:', await trainingRes.text());
          throw new Error('Training API failed');
        }

        const [modelsData, trainingData] = await Promise.all([modelsRes.json(), trainingRes.json()]);

        // Show tutorial if user has no models or training sessions
        if ((Array.isArray(modelsData) && modelsData.length === 0) || 
            (Array.isArray(trainingData) && trainingData.length === 0)) {
          setShowTutorial(true);
        }

        if (Array.isArray(trainingData) && trainingData.length > 0) {
          const sessions = trainingData;
          const sorted = sessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
          setRecentActivity(sorted.slice(0, 3).map(s => ({
            action: `Trained ${s.modelName} on ${s.datasetId}`,
            time: new Date(s.startTime).toLocaleTimeString()
          })));
          
          // Calculate basic stats from available data
          const completedSessions = sessions.filter(s => s.status === 'completed');
          const successRate = sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0;
          setStats(prev => ({
            ...prev,
            totalSessions: sessions.length,
            successRate: successRate
          }));
        }
        
        // Try to fetch detailed stats separately to avoid blocking dashboard load
        try {
          const statsRes = await fetch('http://localhost:5001/api/training/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setStats(statsData);
          }
        } catch (statsError) {
          console.error('Stats API failed, using calculated stats:', statsError);
          // Stats will remain as calculated from training data
        }

        setLoading(false);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Check your connection to the AI engine.');
        setLoading(false);
      }
    };

    fetchData();
  }, [router, setShowTutorial]);

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
    <Flex minH="100vh" bg={bg}>
      <Sidebar user={user} />
      <Box flex={1} p={8} overflowY="auto">
        <VStack spacing={10} align="stretch">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Flex justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Heading as="h1" size="xl" bgGradient="linear(to-r, teal.300, blue.400)" bgClip="text">
                  Welcome back, {user?.username}
                </Heading>
                <Text color="gray.500" fontSize="lg">Neural systems are operational and awaiting instructions.</Text>
              </VStack>
              <HStack spacing={4}>
                <Box className="glass" px={6} py={3}>
                  <HStack spacing={3}>
                    <Icon as={FiDollarSign} color="teal.400" w={5} h={5} />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" color="gray.500" textTransform="uppercase">Balance</Text>
                      <Text fontWeight="bold" color="teal.300">{(user?.credits || 0).toLocaleString()} CR</Text>
                    </VStack>
                  </HStack>
                </Box>
              </HStack>
            </Flex>
          </motion.div>
          
          <Tutorial isOpen={showTutorial} onClose={() => setShowTutorial(false)} />

          {/* Stats Grid */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Box className="glass" p={6}>
                <Flex align="center" gap={4}>
                  <Icon as={FiBarChart2} w={8} h={8} color="teal.400" />
                  <Box>
                    <Text fontSize="sm" color="gray.500">Inference Load</Text>
                    <Heading size="lg">{stats.totalSessions || 0}</Heading>
                  </Box>
                </Flex>
              </Box>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Box className="glass" p={6}>
                <Flex align="center" gap={4}>
                  <Icon as={FiZap} w={8} h={8} color="purple.400" />
                  <Box>
                    <Text fontSize="sm" color="gray.500">System Accuracy</Text>
                    <Heading size="lg">{stats.successRate || 0}%</Heading>
                  </Box>
                </Flex>
              </Box>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Box className="glass" p={6}>
                <Flex align="center" gap={4}>
                  <Icon as={FiActivity} w={8} h={8} color="orange.400" />
                  <Box>
                    <Text fontSize="sm" color="gray.500">Cluster Latency</Text>
                    <Heading size="lg">{stats.latency || 12}ms</Heading>
                  </Box>
                </Flex>
              </Box>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Box className="glass" p={6}>
                <Flex align="center" gap={4}>
                  <Icon as={FiCpu} w={8} h={8} color="blue.400" />
                  <Box>
                    <Text fontSize="sm" color="gray.500">Active Nodes</Text>
                    <Heading size="lg">{stats.activeNodes || 1204}</Heading>
                  </Box>
                </Flex>
              </Box>
            </motion.div>
          </SimpleGrid>

          {/* Activity and Systems */}
          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
            <Box className="glass" p={8}>
              <Heading size="md" mb={6} color="teal.400">Neural Activity Stream</Heading>
              <VStack align="stretch" spacing={4}>
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <Flex key={index} justify="space-between" align="center" py={4} borderBottom="1px solid" borderColor="rgba(255,255,255,0.05)">
                      <HStack spacing={4}>
                        <Icon as={FiCheckCircle} color="teal.300" />
                        <Text fontWeight="medium" color="gray.200">{activity.action}</Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.500">{activity.time}</Text>
                    </Flex>
                  ))
                ) : (
                  <Text color="gray.600">No recent activity detected in the cluster.</Text>
                )}
              </VStack>
            </Box>

            <Box className="glass" p={8}>
              <Heading size="md" mb={6} color="blue.400">Environment Status</Heading>
              <VStack align="stretch" spacing={6}>
                <Flex justify="space-between" align="center">
                  <Text color="gray.400">Hugging Face Cluster</Text>
                  <Badge colorScheme="green" variant="subtle" px={2} borderRadius="sm">STABLE</Badge>
                </Flex>
                <Flex justify="space-between" align="center">
                  <Text color="gray.400">Epoch Training V2</Text>
                  <Badge colorScheme="green" variant="subtle" px={2} borderRadius="sm">READY</Badge>
                </Flex>
                <Flex justify="space-between" align="center">
                  <Text color="gray.400">Inference Gateway</Text>
                  <Text color="teal.300" fontWeight="bold">ONLINE</Text>
                </Flex>
              </VStack>
            </Box>
          </Grid>
        </VStack>
      </Box>
    </Flex>
  );
}