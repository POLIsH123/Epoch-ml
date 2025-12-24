import { Box, Heading, Text, Button, VStack, Container, Grid, GridItem, Card, CardHeader, CardBody, CardFooter, Badge } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Models() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Get available models
    fetch('/api/models', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      setModels(data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      localStorage.removeItem('token');
      router.push('/login');
    });
  }, [router]);
  
  if (loading) {
    return <Text>Loading models...</Text>;
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="lg">Available Models</Heading>
        
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
          {models.map((model) => (
            <Card key={model._id}>
              <CardHeader>
                <Heading size="md">{model.name}</Heading>
                <Badge colorScheme={model.type === 'RNN' ? 'blue' : model.type === 'CNN' ? 'green' : 'purple'} mt={2}>
                  {model.type}
                </Badge>
              </CardHeader>
              
              <CardBody>
                <Text>{model.description}</Text>
              </CardBody>
              
              <CardFooter>
                <Button 
                  colorScheme="teal" 
                  onClick={() => router.push(`/train?modelId=${model._id}`)}
                >
                  Use Model
                </Button>
              </CardFooter>
            </Card>
          ))}
        </Grid>
        
        {models.length === 0 && (
          <Text textAlign="center" py={8}>
            No models available yet. Please check back later.
          </Text>
        )}
      </VStack>
    </Container>
  );
}
