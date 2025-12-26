import { Box, Heading, Text, Button, VStack, Container, Card, CardHeader, CardBody, Flex, Icon, useColorModeValue, useToast, Grid, Stat, StatLabel, StatNumber, StatHelpText, StatGroup } from '@chakra-ui/react';
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
                <Heading as="h1" size="lg">Resources & Credits</Heading>
                <Text color="gray.500">Manage your computational resources and credits</Text>
              </VStack>
              <Flex align="center" gap={4}>
                <Box p={3} bg="teal.100" borderRadius="md">
                  <Flex align="center" gap={2}>
                    <Icon as={FiDollarSign} color="teal.500" />
                    <Text fontWeight="bold">{user?.credits || 100} credits</Text>
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
                <StatLabel>Available Credits</StatLabel>
                <StatNumber>{user?.credits || 100}</StatNumber>
                <StatHelpText>Credits for model training</StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Active Sessions</StatLabel>
                <StatNumber>2</StatNumber>
                <StatHelpText>Currently running training jobs</StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Storage</StatLabel>
                <StatNumber>4.2 GB</StatNumber>
                <StatHelpText>Used of 10 GB available</StatHelpText>
              </Stat>
            </StatGroup>
          </motion.div>
          
          {/* Purchase Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card bg={cardBg}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiDollarSign} w={6} h={6} color="teal.500" mr={3} />
                  <Heading as="h3" size="md">Purchase Credits</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
                  <Card>
                    <CardBody>
                      <VStack align="start" spacing={3}>
                        <Heading size="sm">100 Credits</Heading>
                        <Text>$5.00</Text>
                        <Button 
                          colorScheme="teal" 
                          size="sm"
                          onClick={() => handlePurchase(100, 5)}
                          isLoading={purchasing}
                        >
                          Purchase
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                  
                  <Card>
                    <CardBody>
                      <VStack align="start" spacing={3}>
                        <Heading size="sm">500 Credits</Heading>
                        <Text>$20.00</Text>
                        <Button 
                          colorScheme="teal" 
                          size="sm"
                          onClick={() => handlePurchase(500, 20)}
                          isLoading={purchasing}
                        >
                          Purchase
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                  
                  <Card>
                    <CardBody>
                      <VStack align="start" spacing={3}>
                        <Heading size="sm">1000 Credits</Heading>
                        <Text>$35.00</Text>
                        <Button 
                          colorScheme="teal" 
                          size="sm"
                          onClick={() => handlePurchase(1000, 35)}
                          isLoading={purchasing}
                        >
                          Purchase
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                </Grid>
              </CardBody>
            </Card>
          </motion.div>
          
          {/* Usage History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card bg={cardBg}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiBarChart2} w={6} h={6} color="blue.500" mr={3} />
                  <Heading as="h3" size="md">Usage History</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <Flex justify="space-between" p={3} bg="gray.100" borderRadius="md">
                    <Text>Model Training: GPT-3 Fine-tuning</Text>
                    <Text color="red">-250 credits</Text>
                  </Flex>
                  <Flex justify="space-between" p={3} bg="gray.100" borderRadius="md">
                    <Text>Model Training: CNN Image Classifier</Text>
                    <Text color="red">-120 credits</Text>
                  </Flex>
                  <Flex justify="space-between" p={3} bg="gray.100" borderRadius="md">
                    <Text>Monthly Credit Top-up</Text>
                    <Text color="green">+500 credits</Text>
                  </Flex>
                  <Flex justify="space-between" p={3} bg="gray.100" borderRadius="md">
                    <Text>Model Training: RNN Sequence Model</Text>
                    <Text color="red">-80 credits</Text>
                  </Flex>
                </VStack>
              </CardBody>
            </Card>
          </motion.div>
        </VStack>
      </Box>
    </Box>
  );
}