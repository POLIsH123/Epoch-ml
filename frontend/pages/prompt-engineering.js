import { Box, Heading, Text, Button, VStack, Container, Card, CardHeader, CardBody, Flex, Icon, useColorModeValue, useToast, Grid, FormControl, FormLabel, Input, Textarea, Select } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiMessageSquare, FiSettings, FiPlay, FiSave, FiList, FiTrendingUp, FiCode, FiUser, FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

const TEMPLATES = [
  {
    name: 'Senior Quant',
    icon: FiTrendingUp,
    prompt: 'You are a world-class Quantitative Analyst. Your objective is to dissect market microstructures, identify alpha signals, and provide rigorous statistical validation for price movements. Maintain a professional, data-driven tone and prioritize mathematical precision in all technical forecasts.',
    modelType: 'GPT-4'
  },
  {
    name: 'Lead Architect',
    icon: FiCode,
    prompt: 'You are a Lead Software Architect specializing in scalable distributed systems. When reviewing configurations or code, focus on long-term maintainability, concurrency bottlenecks, and security-first principles. Provide constructive, industry-standard architectural guidance.',
    modelType: 'GPT-4'
  },
  {
    name: 'ML Research Lead',
    icon: FiInfo,
    prompt: 'You are a Principal AI Researcher. Your role is to suggest optimal hyperparameters, loss functions, and model architectures based on the specific constraints of a dataset. Compare traditional RNN/CNN approaches with modern Transformer-based or State-Space models where appropriate.',
    modelType: 'GPT-4'
  }
];

export default function PromptEngineering() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [modelType, setModelType] = useState('GPT-3.5');
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [savedPrompts, setSavedPrompts] = useState([]);
  const [testing, setTesting] = useState(false);
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

  const handleRunTest = async () => {
    setTesting(true);
    setTestOutput('');
    setTestReasoning('');
    setTestMetadata(null);
    try {
      const response = await fetch('http://localhost:5001/api/playground/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ prompt, testInput, modelType })
      });

      const data = await response.json();
      setTestOutput(data.response);
      setTestReasoning(data.reasoning);
      setTestMetadata(data.metadata);

      toast({
        title: 'Response Generated',
        description: data.metadata?.latency === 'real-time' ? 'Inferred via Hugging Face' : 'Simulated Response',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Test failed',
        description: 'Connectivity issue with the AI engine',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setTesting(false);
    }
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
                <Heading as="h1" size="lg">AI Playground</Heading>
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

          {/* Template Library */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <VStack align="start" spacing={4}>
              <Heading as="h3" size="md">System Prompt Library</Heading>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4} width="100%">
                {TEMPLATES.map((tmpl) => (
                  <Card
                    key={tmpl.name}
                    cursor="pointer"
                    onClick={() => {
                      setPrompt(tmpl.prompt);
                      setModelType(tmpl.modelType);
                    }}
                    transition="all 0.2s"
                    _hover={{ transform: 'translateY(-5px)', shadow: 'md', border: '1px solid teal' }}
                  >
                    <CardBody>
                      <Flex direction="column" align="center" textAlign="center" gap={3}>
                        <Icon as={tmpl.icon} w={8} h={8} color="teal.500" />
                        <Heading size="xs">{tmpl.name}</Heading>
                        <Text fontSize="xs" color="gray.500" noOfLines={2}>{tmpl.prompt}</Text>
                      </Flex>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            </VStack>
          </motion.div>

          {/* Model Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box className="glass" p={6}>
              <VStack align="start" spacing={6}>
                <Heading as="h2" size="md" color="teal.400">System Configuration</Heading>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6} width="100%">
                  <FormControl id="modelType">
                    <FormLabel>Select Model Tier</FormLabel>
                    <Select
                      value={modelType}
                      onChange={(e) => setModelType(e.target.value)}
                      bg="rgba(0,0,0,0.1)"
                    >
                      <option value="GPT-4">Pro Tier (Mistral/Llama High)</option>
                      <option value="GPT-3.5">Standard Tier (Mistral Fast)</option>
                      <option value="BERT">BERT</option>
                    </Select>
                  </FormControl>
                </Grid>
              </VStack>
            </Box>
          </motion.div>

          {/* Prompt Editor */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Box className="glass" p={6}>
              <VStack align="start" spacing={4}>
                <Flex justify="space-between" width="100%" align="center">
                  <Heading as="h2" size="md" color="teal.400">System Prompt Engineering</Heading>
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<FiSettings />}
                    onClick={() => setPrompt('')}
                  >
                    Clear
                  </Button>
                </Flex>
                <FormControl id="prompt">
                  <FormLabel>Behavioral Instructions</FormLabel>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe how the model should behave..."
                    rows={8}
                    bg="rgba(0,0,0,0.1)"
                  />
                </FormControl>
                <Flex justify="flex-end" width="100%" gap={4}>
                  <Button
                    variant="outline"
                    leftIcon={<FiSave />}
                    onClick={handleSavePrompt}
                  >
                    Save Template
                  </Button>
                </Flex>
              </VStack>
            </Box>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Box className="glass" p={6}>
              <Flex align="center" justify="space-between" mb={6}>
                <Flex align="center">
                  <Icon as={FiPlay} w={6} h={6} color="green.400" mr={3} />
                  <Heading as="h3" size="md">Live Inference Playground</Heading>
                </Flex>
                {testMetadata && (
                  <Flex gap={4} fontSize="xs" color="gray.400">
                    <Text><strong>Model:</strong> {testMetadata.model}</Text>
                    <Text><strong>Latency:</strong> {testMetadata.latency}</Text>
                  </Flex>
                )}
              </Flex>
              <VStack spacing={6} align="stretch">
                <FormControl id="testInput">
                  <FormLabel fontWeight="bold">Input Message</FormLabel>
                  <Input
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="Interact with your prompt..."
                    size="lg"
                    bg="rgba(0,0,0,0.1)"
                  />
                </FormControl>

                {testReasoning && (
                  <Box p={4} bg="rgba(237, 137, 54, 0.1)" borderRadius="md" borderLeft="4px solid" borderColor="orange.400">
                    <Heading size="xs" mb={2} color="orange.300" display="flex" align="center">
                      <Icon as={FiSettings} mr={2} /> Chain of Thought Reasoning
                    </Heading>
                    <Text fontSize="sm" fontStyle="italic" color="orange.100">
                      {testReasoning}
                    </Text>
                  </Box>
                )}

                <FormControl id="testOutput">
                  <FormLabel fontWeight="bold">Master Output</FormLabel>
                  <Textarea
                    value={testOutput}
                    placeholder="Awaiting input..."
                    rows={8}
                    isReadOnly
                    bg="rgba(0,0,0,0.2)"
                    fontSize="md"
                    lineHeight="tall"
                    borderColor="rgba(255,255,255,0.1)"
                  />
                </FormControl>

                <Flex justify="flex-end">
                  <Button
                    colorScheme="green"
                    size="lg"
                    leftIcon={<FiPlay />}
                    onClick={handleRunTest}
                    isLoading={testing}
                    loadingText="Reasoning..."
                    px={12}
                    borderRadius="full"
                    bgGradient="linear(to-r, green.400, teal.400)"
                    _hover={{ bgGradient: 'linear(to-r, green.500, teal.500)' }}
                  >
                    Execute
                  </Button>
                </Flex>
              </VStack>
            </Box>
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