import { Box, Heading, FormControl, FormLabel, Input, Button, VStack, Container, Text, Link } from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        router.push('/dashboard');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };
  
  return (
    <Container maxW="container.sm" py={12}>
      <Box p={8} shadow="md" borderWidth="1px" borderRadius="md">
        <VStack spacing={6} align="stretch">
          <Heading as="h1" size="lg">Login to Epoch-ml</Heading>
          
          {error && (
            <Text color="red.500" textAlign="center">{error}</Text>
          )}
          
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl id="email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>
              
              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>
              
              <Button 
                type="submit" 
                colorScheme="teal" 
                width="full"
              >
                Login
              </Button>
            </VStack>
          </form>
          
          <Text textAlign="center">
            Don't have an account?{' '}
            <Link color="teal.500" href="/register">
              Register here
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
}
