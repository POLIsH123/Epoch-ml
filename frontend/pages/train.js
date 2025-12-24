import { Box, Heading, Text, Button, VStack, Container, FormControl, FormLabel, Input, Select, NumberInput, NumberInputField, NumberInputStepper, NumberInputIncrementStepper, NumberInputDecrementStepper, Alert, AlertIcon, AlertTitle, AlertDescription, Progress, useToast } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ModelExporter from '../components/ModelExporter';

export default function Train() {
  const [modelId, setModelId] = useState('');
  const [modelName, setModelName] = useState('');
  const [modelType, setModelType] = useState('');
  const [loading, setLoading] = useState(true);
  const [trainingParams, setTrainingParams] = useState({
    epochs: 10,
    learningRate: 0.001,
    batchSize: 32,
    inputSize: 100,
    hiddenSize: 128,
    outputSize: 10
  });
  const [trainingStatus, setTrainingStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const router = useRouter();
  const toast = useToast();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Get model details if modelId is provided in URL
    if (router.query.modelId) {
      setModelId(router.query.modelId);
      
      fetch(`/api/models/${router.query.modelId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        setModelName(data.name);
        setModelType(data.type);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast({
          title: 'Error',
          description: 'Failed to load model details',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        router.push('/models');
      });
    } else {
      setLoading(false);
    }
  }, [router, toast]);
  
  const handleParamChange = (param, value) => {
    setTrainingParams(prev => ({
      ...prev,
      [param]: value
    }));
  };
  
  const handleStartTraining = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    setIsTraining(true);
    
    try {
      const response = await fetch('/api/training/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          modelId,
          parameters: trainingParams
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTrainingStatus(data);
        toast({
          title: 'Training Started',
          description: 'Your model training has started successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Simulate progress updates
        simulateProgress();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to start training',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setIsTraining(false);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Failed to start training',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsTraining(false);
    }
  };
  
  const simulateProgress = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsTraining(false);
        toast({
          title: 'Training Completed',
          description: 'Your model training has completed successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    }, 2000);
  };
  
  if (loading) {
    return <Text>Loading...</Text>;
  }
  
  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="lg">Train Model</Heading>
        
        {modelId && (
          <Alert status="info">
            <AlertIcon />
            <AlertTitle mr={2}>Model Selected:</AlertTitle>
            <AlertDescription>{modelName} ({modelType})</AlertDescription>
          </Alert>
        )}
        
        <Box p={6} shadow="md" borderWidth="1px" borderRadius="md">
          <VStack spacing={6} align="stretch">
            <Heading as="h3" size="md">Training Parameters</Heading>
            
            <FormControl id="epochs">
              <FormLabel>Epochs (1-1000)</FormLabel>
              <NumberInput 
                min={1} 
                max={1000}
                value={trainingParams.epochs}
                onChange={(value) => handleParamChange('epochs', parseInt(value))}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberInputIncrementStepper />
                  <NumberInputDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            
            <FormControl id="learningRate">
              <FormLabel>Learning Rate</FormLabel>
              <Input 
                type="number" 
                step="0.001"
                value={trainingParams.learningRate}
                onChange={(e) => handleParamChange('learningRate', parseFloat(e.target.value))}
              />
            </FormControl>
            
            <FormControl id="batchSize">
              <FormLabel>Batch Size</FormLabel>
              <NumberInput 
                min={1}
                value={trainingParams.batchSize}
                onChange={(value) => handleParamChange('batchSize', parseInt(value))}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberInputIncrementStepper />
                  <NumberInputDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            
            <FormControl id="inputSize">
              <FormLabel>Input Size</FormLabel>
              <NumberInput 
                min={1}
                value={trainingParams.inputSize}
                onChange={(value) => handleParamChange('inputSize', parseInt(value))}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberInputIncrementStepper />
                  <NumberInputDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            
            <FormControl id="hiddenSize">
              <FormLabel>Hidden Size</FormLabel>
              <NumberInput 
                min={1}
                value={trainingParams.hiddenSize}
                onChange={(value) => handleParamChange('hiddenSize', parseInt(value))}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberInputIncrementStepper />
                  <NumberInputDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            
            <FormControl id="outputSize">
              <FormLabel>Output Size</FormLabel>
              <NumberInput 
                min={1}
                value={trainingParams.outputSize}
                onChange={(value) => handleParamChange('outputSize', parseInt(value))}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberInputIncrementStepper />
                  <NumberInputDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            
            <Button 
              colorScheme="teal" 
              size="lg" 
              onClick={handleStartTraining}
              isLoading={isTraining}
              loadingText="Starting Training..."
            >
              Start Training
            </Button>
          </VStack>
        </Box>
        
        {isTraining && (
          <Box>
            <Text mb={2}>Training Progress: {progress}%</Text>
            <Progress value={progress} size="md" colorScheme="teal" />
          </Box>
        )}
        
        {!isTraining && trainingStatus && (
          <Box>
            <Heading as="h3" size="md" mb={4}>Training Completed</Heading>
            <Text mb={4}>Your model has been successfully trained. You can now export it for use.</Text>
            <ModelExporter 
              modelId={trainingStatus.modelId} 
              modelName={modelName} 
            />
          </Box>
        )}
      </VStack>
    </Container>
  );
}
