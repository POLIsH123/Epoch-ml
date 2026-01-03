import { useState, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Button, 
  Heading, 
  Card,
  CardBody,
  CardHeader,
  Grid,
  GridItem,
  useToast,
  Spinner,
  Badge,
  Flex,
  Icon,
  useColorModeValue,
  Tooltip,
  Divider
} from '@chakra-ui/react';
import { FiDownload, FiDatabase, FiCpu, FiZap, FiInfo, FiX, FiCheck, FiRefreshCw } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';

const ModelDownload = () => {
  const [user, setUser] = useState(null);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState({});
  const toast = useToast();

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      try {
        // Fetch user data
        const userRes = await fetch('http://localhost:5001/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        } else {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }

        // Fetch models
        const modelsRes = await fetch('http://localhost:5001/api/models', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (modelsRes.ok) {
          const modelsData = await modelsRes.json();
          setModels(modelsData);
        } else {
          throw new Error('Failed to fetch models');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [toast]);

  const handleDownload = async (modelId, modelName) => {
    setDownloading(prev => ({ ...prev, [modelId]: true }));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/models/${modelId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Download failed');
      }

      // Create a blob from the response and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${modelName.replace(/\s+/g, '_')}_model.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Download Successful',
        description: `Model "${modelName}" downloaded successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDownloading(prev => ({ ...prev, [modelId]: false }));
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'CNN':
        return 'purple';
      case 'RNN':
        return 'blue';
      case 'RL':
        return 'orange';
      case 'ENSEMBLE':
        return 'green';
      default:
        return 'gray';
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
    <Box bg={bg} minH="100vh">
      <Sidebar user={user} />
      <Box ml="250px" p={6}>
        <VStack spacing={6} align="stretch">
          <Heading as="h1" size="xl">Model Download</Heading>
          
          <Text fontSize="lg" color="gray.500">
            Download your trained models for offline use or sharing
          </Text>

          {models.length === 0 ? (
            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardBody>
                <VStack spacing={4} align="center" py={10}>
                  <Icon as={FiDatabase} w={12} h={12} color="gray.400" />
                  <Text fontSize="lg" fontWeight="medium">No models available</Text>
                  <Text color="gray.500" textAlign="center">
                    Train a model first to download it
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          ) : (
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
              {models.map((model) => (
                <GridItem key={model._id}>
                  <Card bg={cardBg} border="1px solid" borderColor={borderColor} boxShadow="md" height="100%">
                    <CardHeader>
                      <Flex justify="space-between" align="center">
                        <Heading size="md" noOfLines={1}>
                          {model.name}
                        </Heading>
                        <Badge colorScheme={getTypeColor(model.type)}>
                          {model.architecture || model.type}
                        </Badge>
                      </Flex>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Text color="gray.500" noOfLines={2}>
                          {model.description}
                        </Text>
                        
                        <Divider />
                        
                        <HStack justify="space-between" fontSize="sm" color="gray.600">
                          <Text>Created:</Text>
                          <Text>{new Date(model.createdAt).toLocaleDateString()}</Text>
                        </HStack>
                        
                        <HStack justify="space-between" fontSize="sm" color="gray.600">
                          <Text>Layers:</Text>
                          <Text>{model.layers ? model.layers.length : 0}</Text>
                        </HStack>
                        
                        <Divider />
                        
                        <Button
                          leftIcon={<FiDownload />}
                          colorScheme="teal"
                          variant="solid"
                          onClick={() => handleDownload(model._id, model.name)}
                          isLoading={downloading[model._id]}
                          loadingText="Downloading..."
                          isDisabled={downloading[model._id]}
                        >
                          {downloading[model._id] ? 'Downloading...' : 'Download Model'}
                        </Button>
                        
                        <HStack spacing={2} justify="center">
                          <Tooltip label="Model file format: JSON">
                            <Icon as={FiInfo} w={4} h={4} color="gray.500" />
                          </Tooltip>
                          <Text fontSize="xs" color="gray.500">JSON format</Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </GridItem>
              ))}
            </Grid>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default ModelDownload;