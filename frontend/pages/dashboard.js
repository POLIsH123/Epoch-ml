import { Box, Heading, Text, Button, VStack, Container, Grid, GridItem, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, StatGroup } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Get user profile
    fetch('/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      setUser(data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      localStorage.removeItem('token');
      router.push('/login');
    });
  }, [router]);
  
  if (loading) {
    return <Text>Loading...</Text>;
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="lg">Dashboard</Heading>
        
        <StatGroup>
          <Stat>
            <StatLabel>Welcome</StatLabel>
            <StatNumber>{user?.username}</StatNumber>
            <StatHelpText>Your account</StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>Credits</StatLabel>
            <StatNumber>{user?.credits}</StatNumber>
            <StatHelpText>Available for training</StatHelpText>
          </Stat>
        </StatGroup>
        
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
          <GridItem p={6} shadow="md" borderWidth="1px" borderRadius="md">
            <Heading as="h3" size="md" mb={4}>Train New Model</Heading>
            <Text mb={4}>Select a model architecture and configure parameters for training</Text>
            <Button 
              colorScheme="teal" 
              onClick={() => router.push('/train')}
            >
              Start Training
            </Button>
          </GridItem>
          
          <GridItem p={6} shadow="md" borderWidth="1px" borderRadius="md">
            <Heading as="h3" size="md" mb={4}>View Models</Heading>
            <Text mb={4}>Browse available model architectures</Text>
            <Button 
              variant="outline" 
              colorScheme="teal" 
              onClick={() => router.push('/models')}
            >
              Browse Models
            </Button>
          </GridItem>
        </Grid>
      </VStack>
    </Container>
  );
}
