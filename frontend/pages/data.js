import { Box, Heading, Text, Button, VStack, Container, Card, CardHeader, CardBody, Flex, Icon, useColorModeValue, useToast, Grid, Stat, StatLabel, StatNumber, StatHelpText, StatGroup, FormControl, FormLabel, Input, Select, Textarea } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiDatabase, FiUpload, FiFile, FiBarChart2, FiCpu, FiZap, FiDollarSign, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

export default function Data() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [datasets, setDatasets] = useState([]);
  const [newDataset, setNewDataset] = useState({
    name: '',
    description: '',
    type: 'csv',
    size: 0
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
        // Load user datasets
        loadDatasets();
        setLoading(false);
      }
    })
    .catch(err => {
      console.error('Error fetching user data:', err);
      localStorage.removeItem('token');
      router.push('/login');
    });
  }, [router]);
  
  const loadDatasets = () => {
    // Load datasets from the backend
    const token = localStorage.getItem('token');
    fetch('http://localhost:5001/api/resources/datasets', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      setDatasets(data);
    })
    .catch(err => {
      console.error('Error loading datasets:', err);
      toast({
        title: 'Error loading datasets',
        description: 'Could not load your datasets. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });
  };
  
  const handleCreateDataset = async (e) => {
    e.preventDefault();
    
    if (!newDataset.name) {
      toast({
        title: 'Dataset name required',
        description: 'Please enter a name for your dataset',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5001/api/resources/datasets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newDataset.name,
          description: newDataset.description,
          type: newDataset.type
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Add the new dataset to the list
        setDatasets(prev => [...prev, data]);
        setNewDataset({ name: '', description: '', type: 'csv', size: 0 });
        
        toast({
          title: 'Dataset created',
          description: `Dataset "${newDataset.name}" has been created successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error creating dataset',
          description: data.error || 'Could not create dataset',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: 'Network error',
        description: 'Please check your connection and try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      setNewDataset(prev => ({
        ...prev,
        name: file.name.split('.')[0],
        size: parseFloat(sizeInMB)
      }));
    }
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
                <Heading as="h1" size="lg">Data Management</Heading>
                <Text color="gray.500">Upload, manage, and prepare your datasets</Text>
              </VStack>
              <Flex align="center" gap={4}>
                <Box p={3} bg="teal.100" borderRadius="md">
                  <Flex align="center" gap={2}>
                    <Icon as={FiDatabase} color="teal.500" />
                    <Text fontWeight="bold">{datasets.length} datasets</Text>
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
                <StatLabel>Total Datasets</StatLabel>
                <StatNumber>{datasets.length}</StatNumber>
                <StatHelpText>Number of datasets uploaded</StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Storage Used</StatLabel>
                <StatNumber>{datasets.reduce((total, dataset) => {
                  // Convert size to MB for calculation (simplified)
                  const sizeValue = parseFloat(dataset.size);
                  return total + (isNaN(sizeValue) ? 0 : sizeValue);
                }, 0)} MB</StatNumber>
                <StatHelpText>Of 10 GB available</StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Ready to Use</StatLabel>
                <StatNumber>{datasets.filter(d => d.status === 'ready').length}</StatNumber>
                <StatHelpText>Datasets ready for training</StatHelpText>
              </Stat>
            </StatGroup>
          </motion.div>
          
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card bg={cardBg}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiUpload} w={6} h={6} color="teal.500" mr={3} />
                  <Heading as="h3" size="md">Upload New Dataset</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleCreateDataset}>
                  <VStack spacing={4} align="stretch">
                    <FormControl id="name" isRequired>
                      <FormLabel>Dataset Name</FormLabel>
                      <Input 
                        value={newDataset.name}
                        onChange={(e) => setNewDataset(prev => ({...prev, name: e.target.value}))}
                        placeholder="Enter dataset name"
                      />
                    </FormControl>
                    
                    <FormControl id="description">
                      <FormLabel>Description</FormLabel>
                      <Textarea 
                        value={newDataset.description}
                        onChange={(e) => setNewDataset(prev => ({...prev, description: e.target.value}))}
                        placeholder="Describe your dataset"
                        rows={3}
                      />
                    </FormControl>
                    
                    <FormControl id="type" isRequired>
                      <FormLabel>Dataset Type</FormLabel>
                      <Select
                        value={newDataset.type}
                        onChange={(e) => setNewDataset(prev => ({...prev, type: e.target.value}))}
                      >
                        <option value="csv">CSV (Tabular Data)</option>
                        <option value="json">JSON</option>
                        <option value="image">Image Dataset</option>
                        <option value="text">Text Dataset</option>
                        <option value="audio">Audio Dataset</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl id="file">
                      <FormLabel>Upload File</FormLabel>
                      <Input 
                        type="file" 
                        onChange={handleFileUpload}
                        accept=".csv,.json,.txt,.jpg,.jpeg,.png,.mp3,.wav"
                      />
                    </FormControl>
                    
                    <Button 
                      type="submit" 
                      colorScheme="teal" 
                      leftIcon={<FiUpload />}
                      width="full"
                    >
                      Create Dataset
                    </Button>
                  </VStack>
                </form>
              </CardBody>
            </Card>
          </motion.div>
          
          {/* Datasets List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card bg={cardBg}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiFile} w={6} h={6} color="teal.500" mr={3} />
                  <Heading as="h3" size="md">Your Datasets</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                {datasets.length > 0 ? (
                  <Grid templateColumns={{ base: '1fr' }} gap={4}>
                    {datasets.map(dataset => (
                      <Card key={dataset.id} bg={useColorModeValue('gray.50', 'gray.700')}>
                        <CardBody>
                          <Flex justify="space-between" align="center">
                            <VStack align="start" spacing={1}>
                              <Flex align="center" gap={2}>
                                <Heading as="h4" size="sm">{dataset.name}</Heading>
                                <Icon 
                                  as={dataset.status === 'ready' ? FiCheckCircle : FiXCircle} 
                                  color={dataset.status === 'ready' ? 'green.500' : 'yellow.500'} 
                                />
                              </Flex>
                              <Text fontSize="sm" color="gray.500">{dataset.description}</Text>
                              <Flex gap={4} mt={2}>
                                <Text fontSize="xs" bg="gray.200" px={2} py={1} borderRadius="md">
                                  {dataset.type.toUpperCase()}
                                </Text>
                                <Text fontSize="xs" bg="gray.200" px={2} py={1} borderRadius="md">
                                  {dataset.size}
                                </Text>
                              </Flex>
                            </VStack>
                            <Flex gap={2}>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                colorScheme="teal"
                                onClick={() => router.push(`/train?dataset=${dataset.id}`)}
                              >
                                Use for Training
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                colorScheme="gray"
                                leftIcon={<FiInfo />}
                                onClick={() => {
                                  toast({
                                    title: `${dataset.name} Details`,
                                    description: `Type: ${dataset.type}\nStatus: ${dataset.status}\nSize: ${dataset.size}`,
                                    status: 'info',
                                    duration: 5000,
                                    isClosable: true,
                                  });
                                }}
                              >
                                Details
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
                      <Icon as={FiDatabase} w={16} h={16} />
                      <Heading as="h3" size="md">No datasets yet</Heading>
                      <Text>Upload your first dataset to get started</Text>
                    </VStack>
                  </Flex>
                )}
              </CardBody>
            </Card>
          </motion.div>
          
          {/* Data Preparation Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card bg={cardBg}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiInfo} w={6} h={6} color="blue.500" mr={3} />
                  <Heading as="h3" size="md">Data Preparation Tips</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <VStack align="start" spacing={3}>
                  <Text><strong>For RNN Models:</strong> Ensure sequential data is properly formatted with time steps</Text>
                  <Text><strong>For CNN Models:</strong> Images should be normalized and consistently sized</Text>
                  <Text><strong>For GPT Models:</strong> Text data should be tokenized and formatted as sequences</Text>
                  <Text><strong>For RL Models:</strong> Environment data should follow OpenAI Gym format</Text>
                </VStack>
              </CardBody>
            </Card>
          </motion.div>
        </VStack>
      </Box>
    </Box>
  );
}