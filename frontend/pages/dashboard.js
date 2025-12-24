import { Box, Heading, Text, Button, VStack, Container, Grid, GridItem, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, StatGroup, Card, CardHeader, CardBody, Flex, Icon, useColorModeValue } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiCpu, FiBarChart2, FiZap, FiDollarSign, FiDatabase, FiUsers } from 'react-icons/fi';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const bg = useColorModeValue('gray.50', 'gray.900');
  
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
    <Box minH="100vh" bg={bg} py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading as="h1" size="lg">Dashboard</Heading>
            <Text>Welcome, {user?.username}!</Text>
          </Flex>
          
          <StatGroup>
            <Stat>
              <StatLabel>Account</StatLabel>
              <StatNumber>{user?.username}</StatNumber>
              <StatHelpText>Your account</StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Credits</StatLabel>
              <StatNumber>{user?.credits || 100}</StatNumber>
              <StatHelpText>Available for training</StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Models</StatLabel>
              <StatNumber>12</StatNumber>
              <StatHelpText>Available for training</StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Trained</StatLabel>
              <StatNumber>5</StatNumber>
              <StatHelpText>This month</StatHelpText>
            </Stat>
          </StatGroup>
          
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
            <Card>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiZap} w={6} h={6} color="teal.500" mr={3} />
                  <Heading as="h3" size="md">Train New Model</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <Text mb={4}>Select a model architecture and configure parameters for training</Text>
                <Button 
                  colorScheme="teal" 
                  onClick={() => router.push('/train')}
                  leftIcon={<FiCpu />}
                >
                  Start Training
                </Button>
              </CardBody>
            </Card>
            
            <Card>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiDatabase} w={6} h={6} color="blue.500" mr={3} />
                  <Heading as="h3" size="md">View Models</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <Text mb={4}>Browse available model architectures</Text>
                <Button 
                  variant="outline" 
                  colorScheme="teal" 
                  onClick={() => router.push('/models')}
                  leftIcon={<FiBarChart2 />}
                >
                  Browse Models
                </Button>
              </CardBody>
            </Card>
          </Grid>
          
          <Card>
            <CardHeader>
              <Flex align="center">
                <Icon as={FiUsers} w={6} h={6} color="purple.500" mr={3} />
                <Heading as="h3" size="md">Recent Activity</Heading>
              </Flex>
            </CardHeader>
            <CardBody>
              <Text>No recent activity yet. Start training your first model!</Text>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}