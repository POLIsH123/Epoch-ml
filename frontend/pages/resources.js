import { Box, Heading, Text, Button, VStack, HStack, Container, Card, CardHeader, CardBody, Flex, Icon, useColorModeValue, useToast, Grid, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatGroup, Badge } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiDollarSign, FiCpu, FiDatabase, FiActivity, FiZap, FiBarChart2, FiUser, FiSettings } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

export default function Resources() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
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
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Error fetching user data:', err);
        localStorage.removeItem('token');
        router.push('/login');
      });
  }, [router]);

  const handlePurchase = async (credits, cost) => {
    setPurchasing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real implementation, this would connect to a payment processor
    // For now, we'll just show a success message
    toast({
      title: 'Purchase successful',
      description: `${credits} credits have been added to your account`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    // Update user credits locally (in a real app, we'd fetch updated profile)
    setUser(prev => ({ ...prev, credits: (prev.credits || 0) + credits }));

    setPurchasing(false);
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
                  Neural Resources
                </Heading>
                <Text color="gray.500" fontSize="lg">Management of computational tokens and usage telemetry.</Text>
              </VStack>
              <Box className="glass" px={6} py={3}>
                <HStack spacing={3}>
                  <Icon as={FiZap} color="teal.400" />
                  <Text fontWeight="bold" color="teal.300">SYSTEM READY</Text>
                </HStack>
              </Box>
            </Flex>
          </motion.div>

          {/* Stats Section */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Box className="glass" p={6}>
                <VStack align="start" spacing={1}>
                  <Text fontSize="xs" color="gray.500" textTransform="uppercase">Available Credits</Text>
                  <Heading size="lg" color="teal.300">{user?.credits || 0} CR</Heading>
                  <Text fontSize="xs" color="gray.600">Model training capacity</Text>
                </VStack>
              </Box>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Box className="glass" p={6}>
                <VStack align="start" spacing={1}>
                  <Text fontSize="xs" color="gray.500" textTransform="uppercase">Active Sessions</Text>
                  <Heading size="lg" color="blue.300">2 NODES</Heading>
                  <Text fontSize="xs" color="gray.600">Current training load</Text>
                </VStack>
              </Box>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Box className="glass" p={6}>
                <VStack align="start" spacing={1}>
                  <Text fontSize="xs" color="gray.500" textTransform="uppercase">Storage Load</Text>
                  <Heading size="lg" color="orange.300">42%</Heading>
                  <Text fontSize="xs" color="gray.600">4.2 GB of 10 GB used</Text>
                </VStack>
              </Box>
            </motion.div>
          </SimpleGrid>

          {/* Purchase Options */}
          <Box className="glass" p={8}>
            <Flex align="center" mb={8}>
              <Icon as={FiDollarSign} w={6} h={6} color="teal.400" mr={3} />
              <Heading size="md">Acquire Neural Tokens</Heading>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              {[
                { amount: 100, price: 5, color: 'teal' },
                { amount: 500, price: 20, color: 'blue', popular: true },
                { amount: 1000, price: 35, color: 'purple' }
              ].map((pkg, idx) => (
                <Box
                  key={idx}
                  p={6}
                  bg="rgba(255,255,255,0.02)"
                  borderRadius="2xl"
                  border="1px solid"
                  borderColor={pkg.popular ? 'teal.500' : 'whiteAlpha.100'}
                  textAlign="center"
                  position="relative"
                >
                  {pkg.popular && (
                    <Badge
                      position="absolute"
                      top={-3}
                      left="50%"
                      transform="translateX(-50%)"
                      colorScheme="teal"
                      borderRadius="full"
                      px={4}
                    >
                      OPTIMAL CHOICE
                    </Badge>
                  )}
                  <VStack spacing={4}>
                    <Text fontSize="sm" color="gray.500" textTransform="uppercase">Packet</Text>
                    <Heading size="xl">{pkg.amount}</Heading>
                    <Text fontSize="lg" color="teal.300" fontWeight="bold">${pkg.price}.00</Text>
                    <Button
                      w="full"
                      colorScheme={pkg.color}
                      borderRadius="full"
                      variant={pkg.popular ? 'solid' : 'outline'}
                      onClick={() => handlePurchase(pkg.amount, pkg.price)}
                      isLoading={purchasing}
                    >
                      Initialize Transfer
                    </Button>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </Box>

          {/* Usage History */}
          <Box className="glass" p={8}>
            <Flex align="center" mb={8}>
              <Icon as={FiBarChart2} w={6} h={6} color="blue.400" mr={3} />
              <Heading size="md">Consumption Logs</Heading>
            </Flex>

            <VStack align="stretch" spacing={3}>
              {[
                { label: 'Neural Core Fine-tuning', value: -250, type: 'cost' },
                { label: 'CNN Architecture Deployment', value: -120, type: 'cost' },
                { label: 'System Credit Top-up', value: 500, type: 'credit' },
                { label: 'RNN Sequence Optimization', value: -80, type: 'cost' }
              ].map((log, idx) => (
                <Flex
                  key={idx}
                  justify="space-between"
                  p={4}
                  bg="rgba(255,255,255,0.03)"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                  align="center"
                >
                  <HStack spacing={4}>
                    <Icon as={log.type === 'cost' ? FiCpu : FiZap} color={log.type === 'cost' ? 'gray.500' : 'teal.400'} />
                    <Text fontWeight="medium">{log.label}</Text>
                  </HStack>
                  <Text fontWeight="bold" color={log.type === 'cost' ? 'red.400' : 'teal.400'}>
                    {log.value > 0 ? '+' : ''}{log.value} CR
                  </Text>
                </Flex>
              ))}
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}