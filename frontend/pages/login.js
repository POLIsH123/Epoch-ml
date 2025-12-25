import { Box, Heading, FormControl, FormLabel, Input, Button, VStack, Container, Text, Link, useColorModeValue, useToast, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { FiUser, FiLock, FiLogIn, FiBarChart2 } from 'react-icons/fi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();
  
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
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
        toast({
          title: 'Login successful',
          description: `Welcome back, ${data.user.username}!`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        router.push('/dashboard');
      } else {
        setError(data.error);
        toast({
          title: 'Login failed',
          description: data.error,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      toast({
        title: 'Network error',
        description: 'Please check your connection and try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Flex minH="100vh" bg={bg} align="center" justify="center">
      <Box w="full" maxW="container.md" p={8}>
        <Flex direction="column" align="center" mb={8}>
          <Box p={4} bg="teal.500" borderRadius="full" mb={4}>
            <FiBarChart2 color="white" size={30} />
          </Box>
          <Heading as="h1" size="xl">Welcome to Epoch-ml</Heading>
          <Text color="gray.500" mt={2}>Sign in to your account</Text>
        </Flex>
        
        <Box p={8} shadow="xl" borderWidth="1px" borderRadius="lg" bg={cardBg}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={6}>
              {error && (
                <Text color="red.500" textAlign="center">{error}</Text>
              )}
              
              <FormControl id="email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<FiUser />}
                  placeholder="your@email.com"
                  isDisabled={loading}
                />
              </FormControl>
              
              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<FiLock />}
                  placeholder="••••••••"
                  isDisabled={loading}
                />
              </FormControl>
              
              <Button 
                type="submit" 
                colorScheme="teal" 
                width="full"
                size="lg"
                rightIcon={<FiLogIn />}
                isLoading={loading}
              >
                Sign In
              </Button>
            </VStack>
          </form>
          
          <Text textAlign="center" mt={6}>
            Don't have an account?{' '}
            <Link color="teal.500" href="/register" fontWeight="bold">
              Sign up here
            </Link>
          </Text>
        </Box>
      </Box>
    </Flex>
  );
}