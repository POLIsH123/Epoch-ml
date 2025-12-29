import { Box, Heading, Text, Button, VStack, Container, Card, CardHeader, CardBody, Grid, FormControl, FormLabel, Select, Input, useColorModeValue, useToast, Flex, Icon, Spinner, Textarea } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiCpu, FiDatabase, FiPlay, FiUpload, FiBarChart2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

export default function TestModel() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [formData, setFormData] = useState({
    modelId: '',
    datasetId: '',
    testData: ''
  });
  const [testResults, setTestResults] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
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

    // Fetch user profile, models, and datasets
    Promise.all([
      fetch('http://localhost:5001/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()),

      fetch('http://localhost:5001/api/models', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()),

      fetch('http://localhost:5001/api/resources/datasets', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json())
    ])
      .then(([userData, modelData, datasetData]) => {
        setUser(userData);
        // Filter out GPT/BERT models and RL models for regular testing
        const filteredModels = modelData.filter(model =>
          !['GPT-2', 'GPT-3', 'GPT-3.5', 'GPT-4', 'BERT', 'T5', 'DQN', 'A2C', 'PPO', 'SAC', 'DDPG', 'TD3'].includes(model.type)
        );
        setModels(filteredModels);
        setDatasets(datasetData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        localStorage.removeItem('token');
        router.push('/login');
      });
  }, [router]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestModel = async (e) => {
    e.preventDefault();

    if (!formData.modelId || (!formData.datasetId && !formData.testData)) {
      toast({
        title: 'Missing required fields',
        description: 'Please select a model and either a dataset or enter test data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsTesting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/models/${formData.modelId}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          testData: formData.testData,
          datasetId: formData.datasetId
        })
      });

      const data = await response.json();

      if (response.ok) {
        setTestResults({
          ...data,
          model: models.find(m => m._id === formData.modelId)?.name,
          type: models.find(m => m._id === formData.modelId)?.type
        });

        toast({
          title: 'Testing completed',
          description: 'Model has been tested successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(data.error || 'Testing failed');
      }
    } catch (err) {
      toast({
        title: 'Testing failed',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsTesting(false);
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
              <VStack align="start" spacing={1}>
                <Heading as="h1" size="xl" bgGradient="linear(to-r, teal.300, blue.400)" bgClip="text">
                  Neural Testing Suite
                </Heading>
                <Text color="gray.500" fontSize="lg">Validate and probe deployed neural cores.</Text>
              </VStack>
              <Box className="glass" px={6} py={3}>
                <HStack spacing={3}>
                  <Icon as={FiCpu} color="teal.400" />
                  <Text fontWeight="bold" color="gray.200">{models.length} CORES ONLINE</Text>
                </HStack>
              </Box>
            </Flex>
          </motion.div>

          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8}>
            {/* Control Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Box className="glass" p={8}>
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="teal.300">Test Configuration</Heading>

                  <FormControl id="modelId" isRequired>
                    <FormLabel>Target Core</FormLabel>
                    <Select
                      value={formData.modelId}
                      onChange={(e) => handleInputChange('modelId', e.target.value)}
                      bg="rgba(0,0,0,0.2)"
                      border="none"
                      placeholder="Select target model..."
                    >
                      {models.map(model => (
                        <option key={model.id || model._id} value={model.id || model._id}>
                          {model.name} ({model.type})
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl id="datasetId">
                    <FormLabel>Payload Source (Optional)</FormLabel>
                    <Select
                      value={formData.datasetId}
                      onChange={(e) => handleInputChange('datasetId', e.target.value)}
                      bg="rgba(0,0,0,0.2)"
                      border="none"
                      placeholder="Select verification dataset..."
                    >
                      {datasets.map(dataset => (
                        <option key={dataset.id} value={dataset.id}>
                          {dataset.name} ({dataset.size})
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl id="testData">
                    <FormLabel>Manual Neural Payload (JSON/CSV)</FormLabel>
                    <Textarea
                      value={formData.testData}
                      onChange={(e) => handleInputChange('testData', e.target.value)}
                      bg="rgba(0,0,0,0.1)"
                      border="none"
                      rows={6}
                      placeholder="Enter raw neural vectors..."
                      _focus={{ ring: '1px solid', ringColor: 'teal.400' }}
                    />
                  </FormControl>

                  <Button
                    onClick={handleTestModel}
                    colorScheme="teal"
                    w="full"
                    size="lg"
                    isLoading={isTesting}
                    loadingText="Probing Core..."
                    leftIcon={<FiPlay />}
                    borderRadius="full"
                    bgGradient="linear(to-r, teal.400, blue.500)"
                    _hover={{ bgGradient: 'linear(to-r, teal.500, blue.600)', transform: 'translateY(-2px)' }}
                  >
                    Initiate Neural Probe
                  </Button>
                </VStack>
              </Box>
            </motion.div>

            {/* Results Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Box className="glass" p={8} h="full">
                <Heading size="md" color="blue.400" mb={6}>Probe Diagnostics</Heading>

                {!testResults ? (
                  <Flex direction="column" align="center" justify="center" h="80%" color="gray.600">
                    <Icon as={FiBarChart2} w={16} h={16} mb={4} opacity={0.5} />
                    <Text fontSize="lg">Awaiting diagnostic results...</Text>
                  </Flex>
                ) : (
                  <VStack align="stretch" spacing={6}>
                    <Box p={6} bg="rgba(45, 212, 191, 0.05)" borderRadius="xl" border="1px solid" borderColor="teal.500">
                      <Flex justify="space-between" align="center">
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" color="teal.400" fontWeight="bold">SYNCHRONIZATION CONFIDENCE</Text>
                          <Heading size="2xl" color="white">
                            {(testResults.accuracy * 100).toFixed(2)}%
                          </Heading>
                        </VStack>
                        <Icon as={FiZap} w={10} h={10} color="teal.300" />
                      </Flex>
                    </Box>

                    <SimpleGrid columns={2} spacing={4}>
                      <Box p={4} bg="rgba(0,0,0,0.2)" borderRadius="lg">
                        <Text fontSize="xs" color="gray.500">SYSTEM LOSS</Text>
                        <Text fontWeight="bold" fontSize="lg">{testResults.loss.toFixed(6)}</Text>
                      </Box>
                      <Box p={4} bg="rgba(0,0,0,0.2)" borderRadius="lg">
                        <Text fontSize="xs" color="gray.500">NODES ACTIVATED</Text>
                        <Text fontWeight="bold" fontSize="lg">{testResults.nodesCount || 1024}</Text>
                      </Box>
                    </SimpleGrid>

                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={2}>NEURAL OUTPUT VECTOR</Text>
                      <Box
                        p={4}
                        bg="rgba(0,0,0,0.4)"
                        borderRadius="md"
                        fontFamily="mono"
                        fontSize="xs"
                        color="green.300"
                        maxH="150px"
                        overflowY="auto"
                      >
                        {JSON.stringify(testResults.predictions, null, 2)}
                      </Box>
                    </Box>

                    <Button
                      variant="ghost"
                      colorScheme="blue"
                      leftIcon={<FiDownload />}
                      borderRadius="full"
                      size="sm"
                    >
                      Export Diagnostic Report
                    </Button>
                  </VStack>
                )}
              </Box>
            </motion.div>
          </Grid>
        </VStack>
      </Box>
    </Box>
  );
}