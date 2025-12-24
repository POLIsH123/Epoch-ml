import { Box, Heading, Text, VStack, Container, Grid, GridItem, Card, CardHeader, CardBody, CardFooter, Badge, Button, useToast } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TrainingVisualization from '../components/TrainingVisualization';

export default function TrainingHistory() {
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const router = useRouter();
  const toast = useToast();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Get user's training history
    fetch('/api/training', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      setTrainingSessions(data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Failed to load training history',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    });
  }, [router, toast]);
  
  if (loading) {
    return <Text>Loading training history...</Text>;
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="lg">Training History</Heading>
        
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }} gap={6}>
          <GridItem colSpan={1}>
            <VStack spacing={4} align="stretch">
              <Heading as="h2" size="md">Past Sessions</Heading>
              
              {trainingSessions.length > 0 ? (
                trainingSessions.map((session) => (
                  <Card 
                    key={session._id}
                    onClick={() => setSelectedSession(session)}
                    cursor="pointer"
                    bg={selectedSession?._id === session._id ? 'teal.50' : 'white'}
                    _hover={{ bg: 'gray.50' }}
                  >
                    <CardHeader pb={2}>
                      <Heading size="sm">{session.modelId?.name || 'Unknown Model'}</Heading>
                      <Badge 
                        colorScheme={
                          session.status === 'completed' ? 'green' : 
                          session.status === 'running' ? 'blue' : 
                          session.status === 'failed' ? 'red' : 'gray'
                        }
                        mt={2}
                      >
                        {session.status}
                      </Badge>
                    </CardHeader>
                    
                    <CardBody pt={2}>
                      <Text fontSize="sm">
                        Started: {new Date(session.createdAt).toLocaleString()}
                      </Text>
                      <Text fontSize="sm">
                        Progress: {session.progress}%
                      </Text>
                    </CardBody>
                  </Card>
                ))
              ) : (
                <Text>No training sessions found.</Text>
              )}
            </VStack>
          </GridItem>
          
          <GridItem colSpan={2}>
            {selectedSession ? (
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardHeader>
                    <Heading size="md">
                      {selectedSession.modelId?.name || 'Training Session'}
                    </Heading>
                  </CardHeader>
                  
                  <CardBody>
                    <TrainingVisualization trainingSession={selectedSession} />
                  </CardBody>
                </Card>
              </VStack>
            ) : (
              <Text textAlign="center" py={8} color="gray.500">
                Select a training session to view details
              </Text>
            )}
          </GridItem>
        </Grid>
      </VStack>
    </Container>
  );
}
