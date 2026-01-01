import { useState, useEffect } from 'react';
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
  Divider
} from '@chakra-ui/react';

const AiPlayground = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt2');
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState([
    { id: 'bert-base-uncased', name: 'BERT (Text Understanding)' },
    { id: 't5-small', name: 'T5 (Text-to-Text Transfer)' },
    { id: 'facebook/bart-large-cnn', name: 'BART (Text Summarization)' },
  ]);
  
  const toast = useToast();

  // Load API key from localStorage if available
  useEffect(() => {
    const savedApiKey = localStorage.getItem('huggingFaceApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

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

    if (!apiKey) {
      toast({
        title: 'Error',
        description: 'Please enter your Hugging Face API key',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    setResponse('');

    try {
      const response = await fetch(`https://api-inference.huggingface.co/models/${selectedModel}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 200,
            return_full_text: false,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate text');
      }

      const data = await response.json();
      setResponse(data[0]?.generated_text || 'No response generated');
      
      // Save API key to localStorage
      localStorage.setItem('huggingFaceApiKey', apiKey);
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

  return (
    <Box p={6} maxW="800px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center" mb={6}>
          AI Playground
        </Heading>
        
        <Card>
          <CardHeader>
            <Heading size="md">Hugging Face API Configuration</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text>
                Enter your Hugging Face API key to use the AI playground. Get your API key from{' '}
                <a 
                  href="https://huggingface.co/settings/tokens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#3182ce', textDecoration: 'underline' }}
                >
                  Hugging Face Settings
                </a>
              </Text>
              <Input
                placeholder="Enter your Hugging Face API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                type="password"
              />
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Model Selection</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </Select>
              <Text fontSize="sm" color="gray.500">
                Selected model: <strong>{models.find(m => m.id === selectedModel)?.name}</strong>
              </Text>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Input Prompt</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Textarea
                placeholder="Enter your prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={6}
                disabled={loading}
              />
              <HStack spacing={3} justify="flex-end">
                <Button
                  onClick={() => setPrompt('')}
                  variant="outline"
                  colorScheme="gray"
                  disabled={loading}
                >
                  Clear
                </Button>
                <Button
                  onClick={generateText}
                  colorScheme="blue"
                  isLoading={loading}
                  leftIcon={loading ? <Spinner size="sm" /> : null}
                >
                  {loading ? 'Generating...' : 'Generate Text'}
                </Button>
              </HStack>
              <Text fontSize="sm" color="gray.500">
                Tip: Press Ctrl+Enter to generate text quickly
              </Text>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Generated Response</Heading>
          </CardHeader>
          <CardBody>
            <Box
              p={4}
              bg="gray.50"
              borderRadius="md"
              minH="150px"
              whiteSpace="pre-wrap"
            >
              {response ? (
                <Text>{response}</Text>
              ) : (
                <Text color="gray.500" fontStyle="italic">
                  Your generated text will appear here...
                </Text>
              )}
            </Box>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">About This Playground</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <Text>
                This AI Playground allows you to interact with state-of-the-art models from Hugging Face.
              </Text>
              <Text>
                Supported models include text generation, text understanding, summarization, and more.
              </Text>
              <Divider />
              <Text fontSize="sm" color="gray.600">
                Note: API usage may be subject to Hugging Face's rate limits and pricing.
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default AiPlayground;