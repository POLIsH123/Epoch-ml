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
        setDatasets(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Error loading datasets:', err);
        setDatasets([]); // Ensure it's always an array
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
        setDatasets(prev => Array.isArray(prev) ? [...prev, data] : [data]);
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
                  Neural Data Repository
                </Heading>
                <Text color="gray.500" fontSize="lg">Management terminal for training payloads and data schemas.</Text>
              </VStack>
              <Box className="glass" px={6} py={3}>
                <HStack spacing={3}>
                  <Icon as={FiDatabase} color="blue.400" />
                  <Text fontWeight="bold" color="blue.300">{datasets.length} PAYLOADS ONLINE</Text>
                </HStack>
              </Box>
            </Flex>
          </motion.div>

          {/* Stats Section */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <Box className="glass" p={6}>
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.500" textTransform="uppercase">Total Payloads</Text>
                <Heading size="lg" color="white">{datasets.length}</Heading>
                <Text fontSize="xs" color="gray.600">Registered neural sources</Text>
              </VStack>
            </Box>

            <Box className="glass" p={6}>
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.500" textTransform="uppercase">Telemetry Volume</Text>
                <Heading size="lg" color="teal.300">
                  {Array.isArray(datasets) ? datasets.reduce((total, d) => total + parseFloat(d.size || 0), 0).toFixed(2) : 0} MB
                </Heading>
                <Text fontSize="xs" color="gray.600">Of 10 GB limit</Text>
              </VStack>
            </Box>

            <Box className="glass" p={6}>
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.500" textTransform="uppercase">Integrity Status</Text>
                <Heading size="lg" color="green.300">
                  {Array.isArray(datasets) ? datasets.filter(d => d.status === 'ready').length : 0} VALID
                </Heading>
                <Text fontSize="xs" color="gray.600">Datasets verified for training</Text>
              </VStack>
            </Box>
          </SimpleGrid>

          <Grid templateColumns={{ base: '1fr', lg: '1fr 1.5fr' }} gap={8}>
            {/* Upload Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Box className="glass" p={8}>
                <VStack spacing={6} align="stretch">
                  <Flex align="center" gap={3}>
                    <Icon as={FiUpload} color="teal.400" />
                    <Heading size="md" color="teal.300">Provision Payload</Heading>
                  </Flex>

                  <form onSubmit={handleCreateDataset}>
                    <VStack spacing={5} align="stretch">
                      <FormControl id="name" isRequired>
                        <FormLabel fontSize="sm">Payload Identifier</FormLabel>
                        <Input
                          value={newDataset.name}
                          onChange={(e) => setNewDataset(prev => ({ ...prev, name: e.target.value }))}
                          bg="rgba(0,0,0,0.2)"
                          border="none"
                          _focus={{ ring: '1px solid', ringColor: 'teal.400' }}
                          placeholder="e.g., Sentiment-Dataset-Alpha"
                        />
                      </FormControl>

                      <FormControl id="description">
                        <FormLabel fontSize="sm">Schema Context</FormLabel>
                        <Textarea
                          value={newDataset.description}
                          onChange={(e) => setNewDataset(prev => ({ ...prev, description: e.target.value }))}
                          bg="rgba(0,0,0,0.1)"
                          border="none"
                          placeholder="Describe the data landscape..."
                          rows={3}
                        />
                      </FormControl>

                      <FormControl id="type" isRequired>
                        <FormLabel fontSize="sm">Payload Topology</FormLabel>
                        <Select
                          value={newDataset.type}
                          onChange={(e) => setNewDataset(prev => ({ ...prev, type: e.target.value }))}
                          bg="rgba(0,0,0,0.2)"
                          border="none"
                        >
                          <option value="csv">Tabular Core (CSV)</option>
                          <option value="json">Neural JSON</option>
                          <option value="image">Visual Tensor (Images)</option>
                          <option value="text">Linguistic Stream (Text)</option>
                        </Select>
                      </FormControl>

                      <FormControl id="file">
                        <FormLabel fontSize="sm">Source File</FormLabel>
                        <Input
                          type="file"
                          onChange={handleFileUpload}
                          className="glass"
                          pt={1}
                          height="auto"
                          pb={1}
                          border="none"
                        />
                      </FormControl>

                      <Button
                        type="submit"
                        colorScheme="teal"
                        size="lg"
                        leftIcon={<FiZap />}
                        borderRadius="full"
                        bgGradient="linear(to-r, teal.400, blue.500)"
                        _hover={{ bgGradient: 'linear(to-r, teal.500, blue.600)', transform: 'translateY(-2px)' }}
                      >
                        Ingest Dataset
                      </Button>
                    </VStack>
                  </form>
                </VStack>
              </Box>
            </motion.div>

            {/* List Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Box className="glass" p={8} h="full">
                <Flex align="center" gap={3} mb={8}>
                  <Icon as={FiFile} color="blue.400" />
                  <Heading size="md" color="blue.300">Active Payloads</Heading>
                </Flex>

                <VStack spacing={4} align="stretch" maxH="600px" overflowY="auto" pr={2}>
                  {Array.isArray(datasets) && datasets.length > 0 ? (
                    datasets.map((dataset, idx) => (
                      <Box
                        key={dataset.id || idx}
                        p={6}
                        bg="rgba(255,255,255,0.02)"
                        borderRadius="2xl"
                        border="1px solid"
                        borderColor="whiteAlpha.100"
                        transition="all 0.2s"
                        _hover={{ bg: 'rgba(255,255,255,0.05)', borderColor: 'teal.500' }}
                      >
                        <Flex justify="space-between" align="center">
                          <VStack align="start" spacing={1}>
                            <HStack>
                              <Heading size="sm" color="white">{dataset.name}</Heading>
                              <Badge colorScheme={dataset.status === 'ready' ? 'green' : 'orange'} borderRadius="full" variant="subtle">
                                {dataset.status || 'INGESTING'}
                              </Badge>
                            </HStack>
                            <Text fontSize="xs" color="gray.500" noOfLines={1}>{dataset.description || 'No context provided'}</Text>
                            <HStack spacing={2} pt={2}>
                              <Badge colorScheme="blue" variant="outline" fontSize="2xs">{dataset.type.toUpperCase()}</Badge>
                              <Badge colorScheme="gray" variant="outline" fontSize="2xs">{dataset.size}</Badge>
                            </HStack>
                          </VStack>
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="teal"
                            onClick={() => router.push(`/train?dataset=${dataset.id}`)}
                            borderRadius="full"
                          >
                            Synchronize
                          </Button>
                        </Flex>
                      </Box>
                    ))
                  ) : (
                    <Flex direction="column" align="center" justify="center" py={20} color="gray.600">
                      <Icon as={FiDatabase} w={12} h={12} mb={4} opacity={0.5} />
                      <Text>No payloads detected in mainframe.</Text>
                    </Flex>
                  )}
                </VStack>
              </Box>
            </motion.div>
          </Grid>

          {/* Tips Section */}
          <Box className="glass" p={8}>
            <Flex align="center" gap={3} mb={6}>
              <Icon as={FiInfo} color="orange.300" />
              <Heading size="md">Neural Integrity Protocol</Heading>
            </Flex>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              {[
                { label: 'RNN Models', tip: 'Sequential structure required.' },
                { label: 'CNN Models', tip: 'Normalized visual tensors.' },
                { label: 'GPT Models', tip: 'Tokenized linguistic streams.' },
                { label: 'RL Models', tip: 'Formatted state trajectories.' }
              ].map((item, idx) => (
                <VStack key={idx} align="start" p={4} bg="rgba(0,0,0,0.2)" borderRadius="xl">
                  <Text fontWeight="bold" color="teal.300" fontSize="sm">{item.label}</Text>
                  <Text fontSize="xs" color="gray.500">{item.tip}</Text>
                </VStack>
              ))}
            </SimpleGrid>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}