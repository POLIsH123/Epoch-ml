import { Box, Heading, FormControl, FormLabel, Input, Button, VStack, Container, Text, Link, useColorModeValue, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { FiUser, FiMail, FiLock, FiUserPlus } from 'react-icons/fi';

export default function Register() {
  const [username, setUsername] = useState('');
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
      const response = await fetch('http://localhost:12345/api/auth/register', {
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
        toast({
          title: 'Registration successful',
          description: `Welcome to Epoch-ml, ${data.user.username}!`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        router.push('/dashboard');
      } else {
        setError(data.error);
        toast({
          title: 'Registration failed',
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
    <Box minH="100vh" bg={bg} display="flex" alignItems="center" justifyContent="center" py={12}>
      <Container maxW="container.sm" py={12}>
        <Box p={8} shadow="xl" borderWidth="1px" borderRadius="lg" bg={cardBg}>
          <VStack spacing={8} align="center" mb={6}>
            <Box p={4} bg="teal.500" borderRadius="full">
              <FiUserPlus color="white" size={30} />
            </Box>
            <Heading as="h1" size="lg">Create Account</Heading>
            <Text color="gray.500">Join our machine learning platform</Text>
          </VStack>
          
          <form onSubmit={handleSubmit}>
            <VStack spacing={6}>
              {error && (
                <Text color="red.500" textAlign="center">{error}</Text>
              )}
              
              <FormControl id="username" isRequired>
                <FormLabel>Username</FormLabel>
                <Input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  leftIcon={<FiUser />}
                  placeholder="john_doe"
                  isDisabled={loading}
                />
              </FormControl>
              
              <FormControl id="email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<FiMail />}
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
                rightIcon={<FiUserPlus />}
                isLoading={loading}
              >
                Create Account
              </Button>
            </VStack>
          </form>
          
          <Text textAlign="center" mt={6}>
            Already have an account?{' '}
            <Link color="teal.500" href="/login" fontWeight="bold">
              Sign in here
            </Link>
          </Text>
        </Box>
      </Container>
    </Box>
  );
}