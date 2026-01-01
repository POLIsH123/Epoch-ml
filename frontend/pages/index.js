import { Box, Button, VStack, Container, Heading, Text, Flex, Icon, useColorModeValue, useColorMode } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { FiBarChart2, FiCpu, FiDatabase, FiActivity, FiGrid, FiLayers, FiZap, FiUserPlus, FiLogIn, FiSun, FiMoon } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const cardBg = useColorModeValue('white', 'gray.800');
  
  return (
    <Box minH="100vh" bg={bg} color={textColor}>
      <Flex minH="100vh" direction="column">
        {/* Header */}
        <Box py={6} px={8} boxShadow="sm">
          <Flex justify="space-between" align="center">
            <Flex align="center">
              <Icon as={FiBarChart2} w={8} h={8} color="teal.500" mr={3} />
              <Heading as="h1" size="lg">Epoch-ml</Heading>
            </Flex>
            <Flex align="center" gap={4}>
              <Button 
                variant="ghost" 
                leftIcon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
                onClick={toggleColorMode}
              >
                {colorMode === 'light' ? 'Dark' : 'Light'} Mode
              </Button>
              <Button 
                variant="outline" 
                leftIcon={<FiLogIn />} 
                onClick={() => router.push('/login')}
              >
                Login
              </Button>
              <Button 
                colorScheme="teal" 
                leftIcon={<FiUserPlus />} 
                onClick={() => router.push('/register')}
              >
                Sign Up
              </Button>
            </Flex>
          </Flex>
        </Box>
        
        {/* Main Content */}
        <Flex flex={1} align="center" justify="center" py={12}>
          <Container maxW="container.xl">
            <VStack spacing={12} align="center">
              {/* Hero Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <VStack spacing={6} align="center" textAlign="center" maxW="3xl">
                  <Heading as="h1" size="2xl">
                    Build, Train, and Deploy Machine Learning Models
                  </Heading>
                  <Text fontSize="xl" color="gray.500">
                    The most advanced platform for machine learning development with support for RNNs, CNNs, and Reinforcement Learning
                  </Text>
                  <Flex gap={4} mt={6}>
                    <Button 
                      size="lg" 
                      colorScheme="teal" 
                      leftIcon={<FiZap />}
                      onClick={() => router.push('/register')}
                    >
                      Get Started
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      onClick={() => router.push('/login')}
                    >
                      Login
                    </Button>
                  </Flex>
                </VStack>
              </motion.div>
              
              {/* Features Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <VStack spacing={8} align="center" w="full">
                  <Heading as="h2" size="lg">Powerful Features</Heading>
                  
                  <Flex 
                    w="full" 
                    flexWrap="wrap" 
                    justify="center" 
                    gap={8}
                  >
                    <VStack 
                      spacing={4} 
                      p={6} 
                      bg={cardBg} 
                      borderRadius="lg" 
                      boxShadow="md" 
                      w={{ base: 'full', md: '200px' }}
                      align="center"
                    >
                      <Icon as={FiCpu} w={10} h={10} color="teal.500" />
                      <Heading as="h3" size="md">Neural Networks</Heading>
                      <Text textAlign="center">Support for RNN, LSTM, GRU, CNN, and more</Text>
                    </VStack>
                    
                    <VStack 
                      spacing={4} 
                      p={6} 
                      bg={cardBg} 
                      borderRadius="lg" 
                      boxShadow="md" 
                      w={{ base: 'full', md: '200px' }}
                      align="center"
                    >
                      <Icon as={FiActivity} w={10} h={10} color="teal.500" />
                      <Heading as="h3" size="md">Transformer Models</Heading>
                      <Text textAlign="center">BERT, T5 and other transformer architectures</Text>
                    </VStack>
                    
                    <VStack 
                      spacing={4} 
                      p={6} 
                      bg={cardBg} 
                      borderRadius="lg" 
                      boxShadow="md" 
                      w={{ base: 'full', md: '200px' }}
                      align="center"
                    >
                      <Icon as={FiGrid} w={10} h={10} color="teal.500" />
                      <Heading as="h3" size="md">Reinforcement Learning</Heading>
                      <Text textAlign="center">DQN, PPO, A2C, SAC, TD3 algorithms</Text>
                    </VStack>
                    
                    <VStack 
                      spacing={4} 
                      p={6} 
                      bg={cardBg} 
                      borderRadius="lg" 
                      boxShadow="md" 
                      w={{ base: 'full', md: '200px' }}
                      align="center"
                    >
                      <Icon as={FiLayers} w={10} h={10} color="teal.500" />
                      <Heading as="h3" size="md">Ensemble Methods</Heading>
                      <Text textAlign="center">Combine multiple models for better performance</Text>
                    </VStack>
                  </Flex>
                </VStack>
              </motion.div>
              
              {/* CTA Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <VStack spacing={6} align="center" p={8} bg="teal.50" borderRadius="lg" w="full">
                  <Heading as="h2" size="lg" color="teal.800">
                    Ready to Start Building?
                  </Heading>
                  <Text fontSize="lg" color="teal.700" textAlign="center">
                    Join thousands of data scientists and ML engineers using our platform
                  </Text>
                  <Button 
                    size="lg" 
                    colorScheme="teal" 
                    variant="solid" 
                    leftIcon={<FiZap />}
                    onClick={() => router.push('/register')}
                  >
                    Create Account
                  </Button>
                </VStack>
              </motion.div>
            </VStack>
          </Container>
        </Flex>
        
        {/* Footer */}
        <Box py={6} px={8} bg={useColorModeValue('gray.100', 'gray.700')}>
          <Flex justify="space-between" align="center">
            <Text>© 2023 Epoch-ml. All rights reserved.</Text>
            <Flex gap={6}>
              <Text>Terms</Text>
              <Text>Privacy</Text>
              <Text>Documentation</Text>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}
