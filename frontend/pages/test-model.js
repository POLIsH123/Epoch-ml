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
              <VStack align="start" spacing={2}>
                <Heading as="h1" size="lg">Test Model</Heading>
                <Text color="gray.500">Test your trained models on custom data</Text>
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

          {/* Test Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card bg={cardBg}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiPlay} w={6} h={6} color="teal.500" mr={3} />
                  <Heading as="h3" size="md">Test Configuration</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                  <FormControl id="modelId" isRequired>
                    <FormLabel>Model</FormLabel>
                    <Select
                      value={formData.modelId}
                      onChange={(e) => handleInputChange('modelId', e.target.value)}
                    >
                      <option value="">Select a model</option>
                      {models.map(model => (
                        <option key={model._id} value={model._id}>
                          {model.name} ({model.type})
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl id="datasetId">
                    <FormLabel>Dataset (Optional)</FormLabel>
                    <Select
                      value={formData.datasetId}
                      onChange={(e) => handleInputChange('datasetId', e.target.value)}
                    >
                      <option value="">Select a dataset (or enter test data below)</option>
                      {datasets.map(dataset => (
                        <option key={dataset.id} value={dataset.id}>
                          {dataset.name} ({dataset.size})
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <FormControl id="testData" mt={4}>
                  <FormLabel>Test Data (Optional)</FormLabel>
                  <Textarea
                    value={formData.testData}
                    onChange={(e) => handleInputChange('testData', e.target.value)}
                    placeholder="Enter test data here, one input per line, or select a dataset above"
                    rows={4}
                    resize="vertical"
                  />
                </FormControl>

                <Flex justify="flex-end" mt={6}>
                  <Button
                    colorScheme="teal"
                    leftIcon={<FiPlay />}
                    onClick={handleTestModel}
                    isLoading={isTesting}
                  >
                    Test Model
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          </motion.div>

          {/* Test Results */}
          {testResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card bg={cardBg}>
                <CardHeader>
                  <Flex align="center">
                    <Icon as={FiBarChart2} w={6} h={6} color="blue.500" mr={3} />
                    <Heading as="h3" size="md">Test Results</Heading>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <VStack align="start" spacing={4}>
                    <Flex justify="space-between" width="100%" bg="gray.100" p={3} borderRadius="md">
                      <Text><strong>Model:</strong> {testResults.model}</Text>
                      <Text><strong>Type:</strong> {testResults.type}</Text>
                      <Text><strong>Accuracy:</strong> {(testResults.accuracy * 100).toFixed(2)}%</Text>
                      <Text><strong>Processing Time:</strong> {testResults.processingTime}</Text>
                    </Flex>

                    <Heading as="h4" size="sm">Predictions:</Heading>
                    <Grid templateColumns={{ base: '1fr' }} gap={3}>
                      {testResults.predictions && testResults.predictions.map((prediction, index) => (
                        <Card key={index} variant="outline" p={3}>
                          <Flex justify="space-between" align="center">
                            <VStack align="start" spacing={1}>
                              <Text><strong>Input:</strong> {prediction.input}</Text>
                              <Text><strong>Prediction:</strong> {prediction.prediction}</Text>
                            </VStack>
                            <VStack align="end" spacing={1}>
                              <Text><strong>Confidence:</strong> {(prediction.confidence * 100).toFixed(2)}%</Text>
                            </VStack>
                          </Flex>
                        </Card>
                      ))}
                    </Grid>
                  </VStack>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </VStack>
      </Box>
    </Box>
  );
}