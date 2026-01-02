import { Box, Heading, Text, Button, VStack, HStack, Container, Card, CardHeader, CardBody, Flex, Icon, useColorModeValue, useToast, Grid, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatGroup, FormControl, FormLabel, Input, Select, Textarea, Badge, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Checkbox, Stack } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiDatabase, FiUpload, FiFile, FiBarChart2, FiCpu, FiZap, FiDollarSign, FiCheckCircle, FiXCircle, FiInfo, FiImage, FiFileText, FiGrid } from 'react-icons/fi';
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
    size: 0,
    columns: '',
    targetColumn: '',
    imageWidth: 28,
    imageHeight: 28,
    channels: 1,
    normalize: true,
    flattenToNumbers: true,
    maxSequenceLength: 100,
    vocabSize: 10000,
    numClasses: 10,
    taskType: 'classification',
    modelCompatibility: []
  });
  const router = useRouter();
  const toast = useToast();

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    let compatibility = [];
    switch (newDataset.type) {
      case 'image':
        if (newDataset.flattenToNumbers) {
          compatibility = ['CNN', 'ResNet', 'VGG', 'Inception', 'Random Forest', 'Gradient Boosting', 'XGBoost', 'Custom', 'Multi-Layer'];
        } else {
          compatibility = ['CNN', 'ResNet', 'VGG', 'Inception', 'Custom', 'Multi-Layer'];
        }
        break;
      case 'csv':
        compatibility = ['Random Forest', 'Gradient Boosting', 'XGBoost', 'LightGBM', 'Custom', 'Multi-Layer'];
        break;
      case 'text':
        compatibility = ['RNN', 'LSTM', 'GRU', 'Custom', 'Multi-Layer'];
        break;
      case 'json':
        compatibility = ['RNN', 'LSTM', 'GRU', 'Custom', 'Multi-Layer'];
        break;
      default:
        compatibility = ['Custom', 'Multi-Layer'];
    }
    setNewDataset(prev => ({ ...prev, modelCompatibility: compatibility }));
  }, [newDataset.type, newDataset.flattenToNumbers]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetch('http://localhost:5001/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          setUser(data);
          loadDatasets();
          setLoading(false);
        }
      })
      .catch(err => {
        localStorage.removeItem('token');
        router.push('/login');
      });
  }, [router]);

  const loadDatasets = () => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5001/api/resources/datasets', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setDatasets(Array.isArray(data) ? data : []))
      .catch(err => setDatasets([]));
  };

  const handleCreateDataset = async (e) => {
    e.preventDefault();
    if (!newDataset.name) {
      toast({ title: 'Dataset name required', status: 'error', duration: 3000 });
      return;
    }
    if (!newDataset.targetColumn && newDataset.type === 'csv') {
      toast({ title: 'Target column required', status: 'warning', duration: 3000 });
      return;
    }

    let columns = [];
    if (newDataset.type === 'csv' && newDataset.columns) {
      columns = newDataset.columns.split(',').map(c => c.trim());
    } else if (newDataset.type === 'image') {
      const totalPixels = newDataset.imageWidth * newDataset.imageHeight * newDataset.channels;
      columns = newDataset.flattenToNumbers 
        ? [...Array(Math.min(totalPixels, 10)).keys()].map(i => `pixel_${i}`).concat(['...', 'label'])
        : ['image', 'label'];
    } else if (newDataset.type === 'text') {
      columns = ['text', 'label'];
    }

    const datasetPayload = {
      name: newDataset.name,
      description: newDataset.description,
      type: newDataset.type,
      size: typeof newDataset.size === 'number' ? `${newDataset.size} samples` : (newDataset.size || '0 samples'),
      columns: columns,
      targetColumn: newDataset.targetColumn || 'label',
      modelCompatibility: newDataset.modelCompatibility,
      config: {
        taskType: newDataset.taskType,
        numClasses: newDataset.numClasses,
        ...(newDataset.type === 'image' && {
          imageWidth: newDataset.imageWidth,
          imageHeight: newDataset.imageHeight,
          channels: newDataset.channels,
          normalize: newDataset.normalize,
          flattenToNumbers: newDataset.flattenToNumbers
        }),
        ...(newDataset.type === 'text' && {
          maxSequenceLength: newDataset.maxSequenceLength,
          vocabSize: newDataset.vocabSize
        })
      }
    };

    toast({
      title: 'Dataset configured',
      description: `"${newDataset.name}" is ready. Use built-in datasets for actual training.`,
      status: 'success',
      duration: 5000
    });
    
    setNewDataset({ 
      name: '', description: '', type: 'csv', size: 0,
      columns: '', targetColumn: '',
      imageWidth: 28, imageHeight: 28, channels: 1, normalize: true, flattenToNumbers: true,
      maxSequenceLength: 100, vocabSize: 10000,
      numClasses: 10, taskType: 'classification', modelCompatibility: []
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      const fileName = file.name.split('.')[0];
      const extension = file.name.split('.').pop().toLowerCase();
      
      let detectedType = 'csv';
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) detectedType = 'image';
      else if (['txt', 'text'].includes(extension)) detectedType = 'text';
      else if (extension === 'json') detectedType = 'json';
      
      // For CSV files, count the rows
      if (extension === 'csv') {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target.result;
          const lines = text.split('\n').filter(line => line.trim() !== '');
          const numSamples = Math.max(0, lines.length - 1); // Subtract header row
          
          // Try to detect columns from header
          const headerLine = lines[0];
          const detectedColumns = headerLine ? headerLine.split(',').map(c => c.trim().replace(/"/g, '')) : [];
          
          setNewDataset(prev => ({ 
            ...prev, 
            name: fileName, 
            size: numSamples,
            type: detectedType,
            columns: detectedColumns.join(', '),
            targetColumn: detectedColumns.length > 0 ? detectedColumns[detectedColumns.length - 1] : ''
          }));
          
          toast({
            title: 'File analyzed',
            description: `Found ${numSamples} samples and ${detectedColumns.length} columns`,
            status: 'success',
            duration: 3000
          });
        };
        reader.readAsText(file);
      } else if (extension === 'json') {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = JSON.parse(event.target.result);
            const numSamples = Array.isArray(json) ? json.length : (json.data ? json.data.length : 1);
            setNewDataset(prev => ({ ...prev, name: fileName, size: numSamples, type: detectedType }));
          } catch {
            setNewDataset(prev => ({ ...prev, name: fileName, size: sizeInMB + ' MB', type: detectedType }));
          }
        };
        reader.readAsText(file);
      } else {
        // For images and other files, just show file size
        setNewDataset(prev => ({ ...prev, name: fileName, size: sizeInMB + ' MB', type: detectedType }));
      }
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'image': return FiImage;
      case 'text': return FiFileText;
      default: return FiGrid;
    }
  };

  if (loading) {
    return (<Flex minH="100vh" align="center" justify="center" bg={bg}><Text>Loading...</Text></Flex>);
  }

  return (
    <Box minH="100vh" bg={bg}>
      <Sidebar user={user} />
      <Box ml="250px" p={8}>
        <VStack spacing={10} align="stretch">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Flex justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Heading as="h1" size="xl" bgGradient="linear(to-r, teal.300, blue.400)" bgClip="text">
                  Data Configuration
                </Heading>
                <Text color="gray.500" fontSize="lg">Configure datasets with smart preprocessing options.</Text>
              </VStack>
            </Flex>
          </motion.div>

          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Box className="glass" p={8}>
                <VStack spacing={6} align="stretch">
                  <Flex align="center" gap={3}>
                    <Icon as={FiUpload} color="teal.400" />
                    <Heading size="md" color="teal.300">Configure Dataset</Heading>
                  </Flex>

                  <form onSubmit={handleCreateDataset}>
                    <VStack spacing={5} align="stretch">
                      <FormControl isRequired>
                        <FormLabel fontSize="sm">Dataset Name</FormLabel>
                        <Input value={newDataset.name} onChange={(e) => setNewDataset(prev => ({ ...prev, name: e.target.value }))} bg="rgba(0,0,0,0.2)" border="none" placeholder="My Dataset" />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontSize="sm">Data Type</FormLabel>
                        <Select value={newDataset.type} onChange={(e) => setNewDataset(prev => ({ ...prev, type: e.target.value }))} bg="rgba(0,0,0,0.2)" border="none">
                          <option value="csv">Tabular (CSV)</option>
                          <option value="image">Image Data</option>
                          <option value="text">Text/NLP Data</option>
                          <option value="json">Time Series (JSON)</option>
                        </Select>
                      </FormControl>

                      {newDataset.type === 'csv' && (
                        <>
                          <FormControl>
                            <FormLabel fontSize="sm">Column Names (comma-separated)</FormLabel>
                            <Input value={newDataset.columns} onChange={(e) => setNewDataset(prev => ({ ...prev, columns: e.target.value }))} bg="rgba(0,0,0,0.2)" border="none" placeholder="feature1, feature2, label" />
                          </FormControl>
                          <FormControl isRequired>
                            <FormLabel fontSize="sm">Target Column</FormLabel>
                            <Input value={newDataset.targetColumn} onChange={(e) => setNewDataset(prev => ({ ...prev, targetColumn: e.target.value }))} bg="rgba(0,0,0,0.2)" border="none" placeholder="label" />
                          </FormControl>
                        </>
                      )}

                      {newDataset.type === 'image' && (
                        <>
                          <SimpleGrid columns={3} spacing={4}>
                            <FormControl>
                              <FormLabel fontSize="sm">Width</FormLabel>
                              <NumberInput value={newDataset.imageWidth} onChange={(val) => setNewDataset(prev => ({ ...prev, imageWidth: parseInt(val) || 28 }))} min={1} max={512}>
                                <NumberInputField bg="rgba(0,0,0,0.2)" border="none" />
                              </NumberInput>
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="sm">Height</FormLabel>
                              <NumberInput value={newDataset.imageHeight} onChange={(val) => setNewDataset(prev => ({ ...prev, imageHeight: parseInt(val) || 28 }))} min={1} max={512}>
                                <NumberInputField bg="rgba(0,0,0,0.2)" border="none" />
                              </NumberInput>
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="sm">Channels</FormLabel>
                              <Select value={newDataset.channels} onChange={(e) => setNewDataset(prev => ({ ...prev, channels: parseInt(e.target.value) }))} bg="rgba(0,0,0,0.2)" border="none">
                                <option value={1}>Grayscale</option>
                                <option value={3}>RGB</option>
                              </Select>
                            </FormControl>
                          </SimpleGrid>
                          <Stack spacing={3}>
                            <Checkbox isChecked={newDataset.normalize} onChange={(e) => setNewDataset(prev => ({ ...prev, normalize: e.target.checked }))} colorScheme="teal">
                              <Text fontSize="sm">Normalize (0-1)</Text>
                            </Checkbox>
                            <Checkbox isChecked={newDataset.flattenToNumbers} onChange={(e) => setNewDataset(prev => ({ ...prev, flattenToNumbers: e.target.checked }))} colorScheme="teal">
                              <Text fontSize="sm">Flatten to numbers (enables ensemble models)</Text>
                            </Checkbox>
                          </Stack>
                          <Text fontSize="xs" color="gray.500">Features: {newDataset.imageWidth * newDataset.imageHeight * newDataset.channels} pixels</Text>
                        </>
                      )}

                      {newDataset.type === 'text' && (
                        <SimpleGrid columns={2} spacing={4}>
                          <FormControl>
                            <FormLabel fontSize="sm">Max Sequence Length</FormLabel>
                            <NumberInput value={newDataset.maxSequenceLength} onChange={(val) => setNewDataset(prev => ({ ...prev, maxSequenceLength: parseInt(val) || 100 }))} min={10} max={1000}>
                              <NumberInputField bg="rgba(0,0,0,0.2)" border="none" />
                            </NumberInput>
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="sm">Vocabulary Size</FormLabel>
                            <NumberInput value={newDataset.vocabSize} onChange={(val) => setNewDataset(prev => ({ ...prev, vocabSize: parseInt(val) || 10000 }))} min={100} max={100000}>
                              <NumberInputField bg="rgba(0,0,0,0.2)" border="none" />
                            </NumberInput>
                          </FormControl>
                        </SimpleGrid>
                      )}

                      <SimpleGrid columns={2} spacing={4}>
                        <FormControl>
                          <FormLabel fontSize="sm">Task Type</FormLabel>
                          <Select value={newDataset.taskType} onChange={(e) => setNewDataset(prev => ({ ...prev, taskType: e.target.value }))} bg="rgba(0,0,0,0.2)" border="none">
                            <option value="classification">Classification</option>
                            <option value="regression">Regression</option>
                          </Select>
                        </FormControl>
                        {newDataset.taskType === 'classification' && (
                          <FormControl>
                            <FormLabel fontSize="sm">Classes</FormLabel>
                            <NumberInput value={newDataset.numClasses} onChange={(val) => setNewDataset(prev => ({ ...prev, numClasses: parseInt(val) || 2 }))} min={2} max={1000}>
                              <NumberInputField bg="rgba(0,0,0,0.2)" border="none" />
                            </NumberInput>
                          </FormControl>
                        )}
                      </SimpleGrid>

                      <FormControl>
                        <FormLabel fontSize="sm">Upload File</FormLabel>
                        <Input type="file" onChange={handleFileUpload} pt={1} pb={1} border="none" />
                      </FormControl>

                      <Box p={4} bg="rgba(0,0,0,0.2)" borderRadius="xl">
                        <Text fontSize="xs" color="gray.500" mb={2}>Compatible Models:</Text>
                        <HStack wrap="wrap" spacing={2}>
                          {newDataset.modelCompatibility.map((model, idx) => (
                            <Badge key={idx} colorScheme="teal" variant="subtle" fontSize="2xs">{model}</Badge>
                          ))}
                        </HStack>
                      </Box>

                      <Button type="submit" colorScheme="teal" size="lg" leftIcon={<FiZap />} borderRadius="full" bgGradient="linear(to-r, teal.400, blue.500)">
                        Configure Dataset
                      </Button>
                    </VStack>
                  </form>
                </VStack>
              </Box>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <Box className="glass" p={8} h="full">
                <Flex align="center" gap={3} mb={8}>
                  <Icon as={FiFile} color="blue.400" />
                  <Heading size="md" color="blue.300">Available Datasets</Heading>
                </Flex>
                <VStack spacing={4} align="stretch" maxH="600px" overflowY="auto">
                  {datasets.length > 0 ? datasets.map((dataset, idx) => (
                    <Box key={dataset.id || idx} p={5} bg="rgba(255,255,255,0.02)" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" _hover={{ borderColor: 'teal.500' }}>
                      <Flex justify="space-between" align="center">
                        <VStack align="start" spacing={1}>
                          <HStack>
                            <Icon as={getTypeIcon(dataset.type)} color="teal.400" />
                            <Text fontWeight="bold" color="white">{dataset.name}</Text>
                          </HStack>
                          <HStack spacing={2}>
                            <Badge colorScheme="blue" variant="outline" fontSize="2xs">{dataset.type?.toUpperCase()}</Badge>
                            <Badge colorScheme="gray" variant="outline" fontSize="2xs">{dataset.size}</Badge>
                            {dataset.targetColumn && <Badge colorScheme="green" variant="outline" fontSize="2xs">Target: {dataset.targetColumn}</Badge>}
                          </HStack>
                        </VStack>
                        <Button size="sm" variant="ghost" colorScheme="teal" onClick={() => router.push(`/train?dataset=${dataset.id}`)} borderRadius="full">Train</Button>
                      </Flex>
                    </Box>
                  )) : (
                    <Flex direction="column" align="center" py={20} color="gray.600">
                      <Icon as={FiDatabase} w={12} h={12} mb={4} opacity={0.5} />
                      <Text>No custom datasets yet.</Text>
                    </Flex>
                  )}
                </VStack>
              </Box>
            </motion.div>
          </Grid>

          <Box className="glass" p={8}>
            <Flex align="center" gap={3} mb={6}>
              <Icon as={FiInfo} color="orange.300" />
              <Heading size="md">Data Tips</Heading>
            </Flex>
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
              {[
                { icon: FiGrid, label: 'Tabular', tip: 'Set columns & target column' },
                { icon: FiImage, label: 'Images', tip: 'Enable flatten for ensemble models' },
                { icon: FiFileText, label: 'Text', tip: 'Set sequence length for RNN/LSTM' },
                { icon: FiDatabase, label: 'Target', tip: 'Always specify prediction target' }
              ].map((item, idx) => (
                <VStack key={idx} align="start" p={4} bg="rgba(0,0,0,0.2)" borderRadius="xl">
                  <Icon as={item.icon} color="teal.300" />
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
