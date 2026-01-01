import { Box, Heading, FormControl, FormLabel, Input, Button, VStack, Container, Text, Link, useColorModeValue, useToast, Flex } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiLock, FiArrowLeft, FiBarChart2 } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');
  const router = useRouter();
  const toast = useToast();

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    const { token: urlToken } = router.query;
    if (urlToken) {
      setToken(urlToken);
    }
  }, [router.query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast({
          title: 'Password reset successful',
          description: 'Your password has been updated.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(data.error);
        toast({
          title: 'Error',
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
              <Text color="gray.500" fontSize="lg">Neural Key Reset</Text>
            </VStack>

            {success ? (
              <VStack spacing={4}>
                <Box p={4} bg="green.900" borderRadius="md" w="100%">
                  <Text color="green.200">
                    Your password has been successfully reset. Redirecting to login...
                  </Text>
                </Box>
              </VStack>
            ) : (
              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <VStack spacing={5}>
                  {error && (
                    <Box p={3} bg="red.900" borderRadius="md" w="100%">
                      <Text color="red.200" fontSize="sm">{error}</Text>
                    </Box>
                  )}

                  <FormControl id="password" isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold" color="teal.400" textTransform="uppercase">New Neural Key (Password)</FormLabel>
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

                  <FormControl id="confirmPassword" isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold" color="teal.400" textTransform="uppercase">Confirm Neural Key</FormLabel>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                    loadingText="Resetting..."
                    leftIcon={<FiLock />}
                    borderRadius="full"
                    bgGradient="linear(to-r, teal.400, blue.500)"
                    _hover={{ bgGradient: 'linear(to-r, teal.500, blue.600)', transform: 'translateY(-2px)' }}
                    mt={4}
                  >
                    Reset Password
                  </Button>
                </VStack>
              </form>
            )}

            <Link color="teal.300" fontSize="sm" onClick={() => router.push('/login')}>
              Back to Login
            </Link>
          </VStack>
        </Box>
      </motion.div>
    </Flex>
  );
}
