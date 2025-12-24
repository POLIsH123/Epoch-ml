import { Box, Heading, FormControl, FormLabel, Input, Button, VStack, Container, Text, Link } from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
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
          <Heading as="h1" size="lg">Create an Account</Heading>
          
          {error && (
            <Text color="red.500" textAlign="center">{error}</Text>
          )}
          
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl id="username" isRequired>
                <FormLabel>Username</FormLabel>
                <Input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </FormControl>
              
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
                Register
              </Button>
            </VStack>
          </form>
          
          <Text textAlign="center">
            Already have an account?{' '}
            <Link color="teal.500" href="/login">
              Login here
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
}
