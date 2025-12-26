import { Box, Heading, Text, Button, VStack, Container, Card, CardHeader, CardBody, Flex, Icon, useColorModeValue, useToast, Grid, FormControl, FormLabel, Input, Textarea, Select } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiMessageSquare, FiSettings, FiPlay, FiSave, FiList } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

export default function PromptEngineering() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [modelType, setModelType] = useState('GPT-3.5');
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [savedPrompts, setSavedPrompts] = useState([]);
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
  
  const handleTestPrompt = () => {
    // Simulate a response based on the prompt and input
    const responses = {
      'GPT-4': `GPT-4 response: Based on your prompt "${prompt}" and input "${testInput}", here's a sophisticated response.`,
      'GPT-3.5': `GPT-3.5 response: With your prompt "${prompt}" and input "${testInput}", here's a balanced response.`,
      'GPT-3': `GPT-3 response: Using prompt "${prompt}" and input "${testInput}", here's a response.`,
      'BERT': `BERT response: Analyzing your prompt "${prompt}" and input "${testInput}", here's an analysis.`
    };
    
    setTestOutput(responses[modelType] || `Response for ${modelType}: Processing your request with the system prompt.`);
    
    toast({
      title: 'Prompt tested',
      description: 'Your prompt has been processed successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const handleSavePrompt = () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt is empty',
        description: 'Please enter a prompt before saving',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    const newPrompt = {
      id: Date.now().toString(),
      modelType,
      prompt,
      createdAt: new Date().toISOString(),
      name: `${modelType} Prompt - ${new Date().toLocaleDateString()}`
    };
    
    setSavedPrompts(prev => [newPrompt, ...prev]);
    
    toast({
      title: 'Prompt saved',
      description: 'Your prompt has been saved successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const handleLoadPrompt = (savedPrompt) => {
    setModelType(savedPrompt.modelType);
    setPrompt(savedPrompt.prompt);
    
    toast({
      title: 'Prompt loaded',
      description: 'Your saved prompt has been loaded',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
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
                <Heading as="h1" size="lg">Prompt Engineering</Heading>
                <Text color="gray.500">Design and test system prompts for AI models</Text>
              </VStack>
              <Flex align="center" gap={4}>
                <Box p={3} bg="teal.100" borderRadius="md">
                  <Flex align="center" gap={2}>
                    <Icon as={FiMessageSquare} color="teal.500" />
                    <Text fontWeight="bold">{savedPrompts.length} prompts</Text>
                  </Flex>
                </Box>
              </Flex>
            </Flex>
          </motion.div>
          
          {/* Model Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card bg={cardBg}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiSettings} w={6} h={6} color="teal.500" mr={3} />
                  <Heading as="h3" size="md">Model Configuration</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                  <FormControl id="modelType">
                    <FormLabel>Model Type</FormLabel>
                    <Select 
                      value={modelType} 
                      onChange={(e) => setModelType(e.target.value)}
                    >
                      <option value="GPT-4">GPT-4</option>
                      <option value="GPT-3.5">GPT-3.5</option>
                      <option value="GPT-3">GPT-3</option>
                      <option value="BERT">BERT</option>
                    </Select>
                  </FormControl>
                </Grid>
              </CardBody>
            </Card>
          </motion.div>
          
          {/* Prompt Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card bg={cardBg}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiMessageSquare} w={6} h={6} color="blue.500" mr={3} />
                  <Heading as="h3" size="md">System Prompt</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <FormControl id="systemPrompt">
                  <FormLabel>System Prompt</FormLabel>
                  <Textarea 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your system prompt here..."
                    rows={6}
                    resize="vertical"
                  />
                </FormControl>
                
                <Flex justify="flex-end" mt={4} gap={3}>
                  <Button 
                    colorScheme="teal" 
                    leftIcon={<FiPlay />}
                    onClick={handleTestPrompt}
                  >
                    Test Prompt
                  </Button>
                  <Button 
                    colorScheme="blue" 
                    leftIcon={<FiSave />}
                    onClick={handleSavePrompt}
                  >
                    Save Prompt
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          </motion.div>
          
          {/* Test Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card bg={cardBg}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiPlay} w={6} h={6} color="green.500" mr={3} />
                  <Heading as="h3" size="md">Test Prompt</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                  <FormControl id="testInput">
                    <FormLabel>Test Input</FormLabel>
                    <Input 
                      value={testInput} 
                      onChange={(e) => setTestInput(e.target.value)}
                      placeholder="Enter test input..."
                    />
                  </FormControl>
                  
                  <FormControl id="testOutput">
                    <FormLabel>Model Output</FormLabel>
                    <Textarea 
                      value={testOutput} 
                      placeholder="Test results will appear here..."
                      rows={4}
                      isReadOnly
                    />
                  </FormControl>
                </Grid>
                
                <Flex justify="flex-end" mt={4}>
                  <Button 
                    colorScheme="green" 
                    leftIcon={<FiPlay />}
                    onClick={handleTestPrompt}
                  >
                    Run Test
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          </motion.div>
          
          {/* Saved Prompts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card bg={cardBg}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiList} w={6} h={6} color="purple.500" mr={3} />
                  <Heading as="h3" size="md">Saved Prompts</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                {savedPrompts.length === 0 ? (
                  <Text color="gray.500" textAlign="center" py={4}>
                    No saved prompts yet. Save a prompt to see it here.
                  </Text>
                ) : (
                  <Grid templateColumns={{ base: '1fr' }} gap={4}>
                    {savedPrompts.map((savedPrompt) => (
                      <Card key={savedPrompt.id} variant="outline">
                        <CardBody>
                          <Flex justify="space-between" align="center">
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold">{savedPrompt.name}</Text>
                              <Text fontSize="sm" color="gray.500">
                                {savedPrompt.modelType} • {new Date(savedPrompt.createdAt).toLocaleDateString()}
                              </Text>
                              <Text fontSize="sm" noOfLines={1}>
                                {savedPrompt.prompt.substring(0, 100)}{savedPrompt.prompt.length > 100 ? '...' : ''}
                              </Text>
                            </VStack>
                            <Button 
                              colorScheme="teal" 
                              size="sm"
                              onClick={() => handleLoadPrompt(savedPrompt)}
                            >
                              Load
                            </Button>
                          </Flex>
                        </CardBody>
                      </Card>
                    ))}
                  </Grid>
                )}
              </CardBody>
            </Card>
          </motion.div>
        </VStack>
      </Box>
    </Box>
  );
}