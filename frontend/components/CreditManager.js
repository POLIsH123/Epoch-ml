import { Box, Heading, Text, Button, VStack, Container, Grid, GridItem, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, StatGroup, Card, CardHeader, CardBody, CardFooter, useToast } from '@chakra-ui/react';
import { useState, useEffect } from 'react';

export default function CreditManager() {
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pricing, setPricing] = useState(null);
  const toast = useToast();
  
  useEffect(() => {
    fetchCredits();
    fetchPricing();
  }, []);
  
  const fetchCredits = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await fetch('/api/resources/credits', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      setCredits(data.credits);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching credits:', error);
      setLoading(false);
    }
  };
  
  const fetchPricing = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await fetch('/api/resources/pricing', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      setPricing(data);
    } catch (error) {
      console.error('Error fetching pricing:', error);
    }
  };
  
  const addCredits = async (amount) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await fetch('/api/resources/add-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCredits(data.user.credits);
        toast({
          title: 'Credits Added',
          description: data.message,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: data.error,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error adding credits:', error);
      toast({
        title: 'Error',
        description: 'Failed to add credits',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  if (loading) {
    return <Text>Loading credits...</Text>;
  }
  
  return (
    <VStack spacing={6} align="stretch">
      <StatGroup>
        <Stat>
          <StatLabel>Your Credits</StatLabel>
          <StatNumber>{credits}</StatNumber>
          <StatHelpText>Available for training</StatHelpText>
        </Stat>
      </StatGroup>
      
      <Heading as="h2" size="md">Add Credits</Heading>
      
      {pricing && (
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6}>
          {pricing.tiers.map((tier) => (
            <Card key={tier.name}>
              <CardHeader>
                <Heading size="md">{tier.name}</Heading>
              </CardHeader>
              
              <CardBody>
                <Text fontWeight="bold" fontSize="xl">{tier.credits} Credits</Text>
                <Text>${tier.cost} USD</Text>
              </CardBody>
              
              <CardFooter>
                <Button 
                  colorScheme="teal" 
                  width="full"
                  onClick={() => addCredits(tier.credits)}
                >
                  Purchase
                </Button>
              </CardFooter>
            </Card>
          ))}
        </Grid>
      )}
    </VStack>
  );
}
