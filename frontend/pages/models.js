import { Box, Heading, Text, Button, VStack, Container, Grid, Card, CardHeader, CardBody, Flex, Icon, useColorModeValue, useToast, Spinner } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiCpu, FiDatabase, FiActivity, FiLayers, FiGrid, FiBarChart2, FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Models() {
  const [models, setModels] = useState([]);
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
    fetch('http://localhost:9000/api/auth/profile', {
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
        
        // Get available models
        return fetch('http://localhost:9000/api/models', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    })
    .then(res => res.json())
    .then(data => {
      setModels(data);
      setLoading(false);
    })
    .catch(err => {
      console.error('Error fetching data:', err);
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
                <Heading as="h1" size="lg">Available Models</Heading>
                <Text color="gray.500">Choose from our extensive collection of ML models</Text>
              </VStack>
              <Flex align="center" gap={4}>
                <Box p={3} bg="teal.100" borderRadius="md">
                  <Flex align="center" gap={2}>
                    <Icon as={FiCpu} color="teal.500" />
                    <Text fontWeight="bold">{models.length} models</Text>
                  </Flex>
                </Box>
              </Flex>
            </Flex>
          </motion.div>
          
          {/* Model Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
              {models.map(model => {
                // Choose appropriate icon based on model type
                let icon = FiCpu;
                if (model.type.includes('CNN')) icon = FiDatabase;
                if (model.type.includes('GPT') || model.type.includes('Transformer')) icon = FiActivity;
                if (model.type.includes('Reinforcement')) icon = FiGrid;
                if (model.type.includes('Ensemble')) icon = FiLayers;
                
                return (
                  <motion.div
                    key={model._id}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card bg={cardBg} h="full">
                      <CardHeader>
                        <Flex align="center">
                          <Icon as={icon} w={6} h={6} color="teal.500" mr={3} />
                          <Heading as="h3" size="md">{model.name}</Heading>
                        </Flex>
                      </CardHeader>
                      <CardBody>
                        <VStack align="start" spacing={4}>
                          <Text><strong>Type:</strong> {model.type}</Text>
                          <Text><strong>Architecture:</strong> {model.architecture}</Text>
                          <Text><strong>Description:</strong> {model.description}</Text>
                          
                          <Flex justify="space-between" align="center" width="100%" mt={4}>
                            <Button 
                              variant="outline" 
                              colorScheme="teal"
                              onClick={() => router.push(`/train?model=${model._id}`)}
                            >
                              Use Model
                            </Button>
                            <Button 
                              variant="ghost" 
                              colorScheme="teal"
                              leftIcon={<FiInfo />}
                              onClick={() => {
                                // Show more details in a toast or modal
                                toast({
                                  title: `${model.name} Details`,
                                  description: `Architecture: ${model.architecture}\n${model.description}`,
                                  status: 'info',
                                  duration: 5000,
                                  isClosable: true,
                                });
                              }}
                            >
                              Info
                            </Button>
                          </Flex>
                        </VStack>
                      </CardBody>
                    </Card>
                  </motion.div>
                );
              })}
            </Grid>
          </motion.div>
        </VStack>
      </Container>
    </Box>
  );
}