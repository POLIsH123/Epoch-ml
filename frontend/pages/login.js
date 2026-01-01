import { Box, Heading, FormControl, FormLabel, Input, Button, VStack, HStack, Container, Text, Link, useColorModeValue, useToast, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { FiUser, FiLock, FiLogIn, FiBarChart2 } from 'react-icons/fi';
import { motion } from 'framer-motion';

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
    <Flex minH="100vh" bg={bg} align="center" justify="center" p={4}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          className="glass"
          p={10}
          w="full"
          maxW="450px"
          textAlign="center"
          boxShadow="0 0 40px rgba(45, 212, 191, 0.15)"
        >
          <VStack spacing={8}>
            <Box
              p={4}
              bgGradient="linear(to-tr, teal.400, blue.500)"
              borderRadius="2xl"
              boxShadow="0 10px 20px rgba(0,0,0,0.3)"
            >
              <FiBarChart2 color="white" size={40} />
            </Box>

            <VStack spacing={2}>
              <Heading as="h1" size="xl" bgGradient="linear(to-r, teal.300, blue.400)" bgClip="text">
                EPOCH
              </Heading>
              <Text color="gray.500" fontSize="lg">Neural Gateway Initialization</Text>
            </VStack>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <VStack spacing={5}>
                {error && (
                  <Box p={3} bg="red.900" borderRadius="md" w="100%">
                    <Text color="red.200" fontSize="sm">{error}</Text>
                  </Box>
                )}

                <FormControl id="email" isRequired>
                  <FormLabel fontSize="xs" fontWeight="bold" color="teal.400" textTransform="uppercase">Comm Link (Email)</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg="rgba(0,0,0,0.2)"
                    border="none"
                    _focus={{ ring: '1px solid', ringColor: 'teal.400' }}
                    placeholder="architect@epoch.ai"
                    isDisabled={loading}
                  />
                </FormControl>

                <FormControl id="password" isRequired>
                  <FormLabel fontSize="xs" fontWeight="bold" color="teal.400" textTransform="uppercase">Neural Key (Password)</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg="rgba(0,0,0,0.2)"
                    border="none"
                    _focus={{ ring: '1px solid', ringColor: 'teal.400' }}
                    placeholder="••••••••"
                    isDisabled={loading}
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="teal"
                  w="full"
                  size="lg"
                  isLoading={loading}
                  loadingText="Synchronizing..."
                  leftIcon={<FiLogIn />}
                  borderRadius="full"
                  bgGradient="linear(to-r, teal.400, blue.500)"
                  _hover={{ bgGradient: 'linear(to-r, teal.500, blue.600)', transform: 'translateY(-2px)' }}
                  mt={4}
                >
                  Authorize Access
                </Button>
              </VStack>
            </form>

            <VStack spacing={2}>
              <HStack spacing={1}>
                <Text color="gray.500">New Architect?</Text>
                <Link color="teal.300" fontWeight="bold" onClick={() => router.push('/register')}>
                  Initialize Account
                </Link>
              </HStack>
              <Link color="teal.300" fontSize="sm" onClick={() => router.push('/forgot-password')}>
                Neural Key Lost?
              </Link>
            </VStack>
          </VStack>
        </Box>
      </motion.div>
    </Flex>
  );
}