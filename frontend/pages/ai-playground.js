import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Input, 
  Textarea, 
  Button, 
  Heading, 
  Text, 
  Select, 
  useToast,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Divider,
  Container,
  FormControl,
  FormLabel,
  Flex,
  Icon,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Stack,
  Center,
  Wrap,
  WrapItem,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Grid,
  GridItem,
  useColorMode
} from '@chakra-ui/react';
import { FiZap, FiKey, FiCpu, FiMessageSquare, FiSend, FiRefreshCw, FiInfo, FiDatabase, FiCheck, FiX, FiUser, FiSettings, FiSun, FiMoon } from 'react-icons/fi';

const AiPlayground = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt2');
  const [models, setModels] = useState([
    { id: 'gpt2', name: 'GPT-2', description: 'Text generation model', type: 'text-generation' },
    { id: 'bert-base-uncased', name: 'BERT', description: 'Text understanding model', type: 'fill-mask' },
    { id: 'distilgpt2', name: 'DistilGPT-2', description: 'Fast text generation', type: 'text-generation' },
    { id: 't5-small', name: 'T5', description: 'Text-to-text transfer', type: 'text2text-generation' },
    { id: 'facebook/bart-large-cnn', name: 'BART', description: 'Text summarization', type: 'summarization' },
    { id: 'deepset/roberta-base-squad2', name: 'RoBERTa', description: 'Question answering', type: 'question-answering' },
  ]);
  
  const [modelDetails, setModelDetails] = useState({
    gpt2: { maxTokens: 200, latency: '<1s', cost: 'Low' },
    'bert-base-uncased': { maxTokens: 100, latency: '<0.5s', cost: 'Low' },
    distilgpt2: { maxTokens: 150, latency: '<0.8s', cost: 'Low' },
    't5-small': { maxTokens: 100, latency: '<1s', cost: 'Low' },
    'facebook/bart-large-cnn': { maxTokens: 200, latency: '<1.2s', cost: 'Medium' },
    'deepset/roberta-base-squad2': { maxTokens: 100, latency: '<0.7s', cost: 'Low' },
  });
  
  const toast = useToast();
  const responseRef = useRef(null);
  const { colorMode, toggleColorMode } = useColorMode();



  const generateText = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    setResponse('');

    try {
      const response = await fetch('/api/playground/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: selectedModel,
          prompt: prompt,
          maxTokens: modelDetails[selectedModel]?.maxTokens || 200
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate text');
      }

      const data = await response.json();
      setResponse(data.generated_text);
      
      toast({
        title: 'Success',
        description: 'Text generated successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate text',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      generateText();
    }
  };

  const currentModel = models.find(m => m.id === selectedModel);
  const currentModelDetails = modelDetails[selectedModel];

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const inputBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" mb={6}>
          <HStack spacing={4}>
            <Icon as={FiMessageSquare} w={8} h={8} color="teal.500" />
            <Heading as="h1" size="xl" bgGradient="linear(to-r, teal.400, blue.500)" bgClip="text">
              AI Playground
            </Heading>
            <Badge colorScheme="teal" variant="solid">BETA</Badge>
          </HStack>
          <Button leftIcon={colorMode === 'light' ? <FiMoon /> : <FiSun />} onClick={toggleColorMode}>
            {colorMode === 'light' ? 'Dark' : 'Light'}
          </Button>
        </Flex>

        {/* Status Alert */}
        <Alert status="info" borderRadius="md" variant="subtle">
          <AlertIcon />
          <AlertTitle mr={2}>Hugging Face Integration</AlertTitle>
          <AlertDescription>
            Connect your Hugging Face API key to access state-of-the-art models
          </AlertDescription>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>

        <Grid templateColumns={{ base: '1fr', lg: '1fr 2fr' }} gap={6}>
          {/* Left Panel - Configuration */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* API Key Card */}
              <Card bg={cardBg} border="1px solid" borderColor={borderColor} boxShadow="md">
                <CardHeader>
                  <HStack spacing={3}>
                    <Icon as={FiKey} w={6} h={6} color="purple.500" />
                    <Heading size="md">API Configuration</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Text fontSize="sm" color="gray.500">
                      Hugging Face API key is configured on the server. Contact your administrator to update it.
                    </Text>
                    <Alert status="info" borderRadius="md" variant="subtle">
                      <AlertIcon />
                      <AlertDescription>
                        API key is managed server-side for security
                      </AlertDescription>
                    </Alert>
                  </VStack>
                </CardBody>
              </Card>

              {/* Model Selection Card */}
              <Card bg={cardBg} border="1px solid" borderColor={borderColor} boxShadow="md">
                <CardHeader>
                  <HStack spacing={3}>
                    <Icon as={FiCpu} w={6} h={6} color="blue.500" />
                    <Heading size="md">Model Selection</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Select Model</FormLabel>
                      <Select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        bg={inputBg}
                        borderColor={borderColor}
                      >
                        {models.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name} - {model.description}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    {currentModel && currentModelDetails && (
                      <VStack spacing={2} align="stretch" mt={4}>
                        <Text fontWeight="bold" fontSize="lg">
                          {currentModel.name} Details
                        </Text>
                        <HStack spacing={4} wrap="wrap">
                          <Badge colorScheme="green">Type: {currentModel.type}</Badge>
                          <Badge colorScheme="blue">Max Tokens: {currentModelDetails.maxTokens}</Badge>
                          <Badge colorScheme="yellow">Latency: {currentModelDetails.latency}</Badge>
                          <Badge colorScheme="purple">Cost: {currentModelDetails.cost}</Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.500">
                          {currentModel.description}
                        </Text>
                      </VStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* Quick Actions Card */}
              <Card bg={cardBg} border="1px solid" borderColor={borderColor} boxShadow="md">
                <CardHeader>
                  <HStack spacing={3}>
                    <Icon as={FiSettings} w={6} h={6} color="orange.500" />
                    <Heading size="md">Quick Actions</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <Button
                      leftIcon={<FiRefreshCw />}
                      variant="outline"
                      onClick={() => setPrompt('')}
                    >
                      Clear Prompt
                    </Button>
                    <Button
                      leftIcon={<FiZap />}
                      colorScheme="teal"
                      onClick={generateText}
                      isLoading={loading}
                    >
                      {loading ? 'Generating...' : 'Generate Text'}
                    </Button>
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      Press Ctrl+Enter to generate
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>

          {/* Right Panel - Input/Output */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Input Card */}
              <Card bg={cardBg} border="1px solid" borderColor={borderColor} boxShadow="md">
                <CardHeader>
                  <HStack spacing={3}>
                    <Icon as={FiMessageSquare} w={6} h={6} color="green.500" />
                    <Heading size="md">Input Prompt</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <Textarea
                        placeholder="Enter your prompt here..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={8}
                        bg={inputBg}
                        borderColor={borderColor}
                        disabled={loading}
                        fontSize="md"
                      />
                    </FormControl>
                    <HStack spacing={3} justify="flex-end">
                      <Button
                        leftIcon={<FiX />}
                        variant="outline"
                        colorScheme="red"
                        onClick={() => setPrompt('')}
                        disabled={loading}
                      >
                        Clear
                      </Button>
                      <Button
                        leftIcon={<FiSend />}
                        colorScheme="teal"
                        onClick={generateText}
                        isLoading={loading}
                        rightIcon={loading ? <Spinner size="sm" /> : null}
                      >
                        Generate
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Output Card */}
              <Card bg={cardBg} border="1px solid" borderColor={borderColor} boxShadow="md">
                <CardHeader>
                  <HStack spacing={3}>
                    <Icon as={FiDatabase} w={6} h={6} color="red.500" />
                    <Heading size="md">Generated Output</Heading>
                    {response && (
                      <Badge colorScheme="green" ml="auto">
                        <Icon as={FiCheck} mr={1} /> Generated
                      </Badge>
                    )}
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Box
                    ref={responseRef}
                    p={4}
                    bg={inputBg}
                    borderRadius="md"
                    minH="200px"
                    maxH="400px"
                    overflowY="auto"
                    whiteSpace="pre-wrap"
                    border="1px solid"
                    borderColor={borderColor}
                  >
                    {response ? (
                      <Text lineHeight="tall">{response}</Text>
                    ) : (
                      <Center h="150px">
                        <VStack spacing={3}>
                          <Icon as={FiMessageSquare} w={12} h={12} color="gray.400" />
                          <Text color="gray.500" fontStyle="italic">
                            Your generated text will appear here...
                          </Text>
                        </VStack>
                      </Center>
                    )}
                  </Box>
                </CardBody>
              </Card>

              {/* Info Card */}
              <Card bg={cardBg} border="1px solid" borderColor={borderColor} boxShadow="md">
                <CardHeader>
                  <HStack spacing={3}>
                    <Icon as={FiInfo} w={6} h={6} color="yellow.500" />
                    <Heading size="md">About This Playground</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <Text>
                      This AI Playground allows you to interact with state-of-the-art models from Hugging Face.
                    </Text>
                    <Wrap spacing={3}>
                      <WrapItem>
                        <Badge colorScheme="teal">Text Generation</Badge>
                      </WrapItem>
                      <WrapItem>
                        <Badge colorScheme="blue">Text Understanding</Badge>
                      </WrapItem>
                      <WrapItem>
                        <Badge colorScheme="purple">Summarization</Badge>
                      </WrapItem>
                      <WrapItem>
                        <Badge colorScheme="orange">Question Answering</Badge>
                      </WrapItem>
                    </Wrap>
                    <Divider />
                    <Text fontSize="sm" color="gray.600">
                      Note: API usage may be subject to Hugging Face's rate limits and pricing. Your API key is stored locally in your browser.
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>
    </Container>
  );
};

export default AiPlayground;