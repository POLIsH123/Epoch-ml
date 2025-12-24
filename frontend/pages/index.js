import { Box, Heading, Text, Button, VStack, Container, Grid, SimpleGrid, Flex, Icon, useColorModeValue } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { FiCpu, FiBarChart2, FiDatabase, FiActivity, FiZap, FiShield, FiTrendingUp, FiGlobe, FiLock, FiServer, FiLayers, FiGrid } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };
  
  return (
    <Box minH="100vh" bg={bg}>
      {/* Hero Section */}
      <Box py={28}>
        <Container maxW="container.xl">
          <VStack spacing={16} align="center" textAlign="center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Heading 
                as="h1" 
                size="3xl" 
                bgGradient="linear(to-r, teal.400, blue.500)" 
                bgClip="text"
              >
                Epoch-ml
              </Heading>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <Text 
                fontSize="2xl" 
                maxW="4xl" 
                color="gray.600"
              >
                The next-generation machine learning platform that enables you to train, deploy, and manage AI models with ease.
              </Text>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <Flex 
                direction={{ base: 'column', md: 'row' }} 
                gap={8} 
                w="full" 
                justify="center"
              >
                <Button 
                  colorScheme="teal" 
                  size="lg" 
                  px={10}
                  py={6}
                  fontSize="lg"
                  onClick={() => router.push('/register')}
                  leftIcon={<FiZap />}
                  as={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </Button>
                <Button 
                  variant="outline" 
                  colorScheme="teal" 
                  size="lg"
                  px={10}
                  py={6}
                  fontSize="lg"
                  onClick={() => router.push('/login')}
                  as={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Login
                </Button>
              </Flex>
            </motion.div>
          </VStack>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Box py={24} bg={useColorModeValue('gray.100', 'gray.700')}>
        <Container maxW="container.xl">
          <VStack spacing={16}>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <VStack spacing={6}>
                <Heading as="h2" size="2xl">Powerful Features</Heading>
                <Text fontSize="xl" color="gray.600" maxW="2xl">
                  Everything you need to build, train, and deploy machine learning models
                </Text>
              </VStack>
            </motion.div>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
                <motion.div variants={itemVariants}>
                  <Box 
                    p={10} 
                    shadow="md" 
                    borderWidth="1px" 
                    borderRadius="lg" 
                    bg={cardBg}
                    h="full"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    textAlign="center"
                    _hover={{ transform: 'translateY(-5px)', transition: 'transform 0.2s' }}
                  >
                    <Icon as={FiCpu} w={12} h={12} color="teal.500" mb={6} />
                    <Heading as="h3" size="lg" mb={4}>Multiple Model Types</Heading>
                    <Text color="gray.600" fontSize="lg" flex="1" display="flex" alignItems="center">Train RNN, CNN, GPT, and more with customizable parameters</Text>
                  </Box>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Box 
                    p={10} 
                    shadow="md" 
                    borderWidth="1px" 
                    borderRadius="lg" 
                    bg={cardBg}
                    h="full"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    textAlign="center"
                    _hover={{ transform: 'translateY(-5px)', transition: 'transform 0.2s' }}
                  >
                    <Icon as={FiBarChart2} w={12} h={12} color="blue.500" mb={6} />
                    <Heading as="h3" size="lg" mb={4}>Real-time Monitoring</Heading>
                    <Text color="gray.600" fontSize="lg" flex="1" display="flex" alignItems="center">Track training progress with live metrics and visualizations</Text>
                  </Box>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Box 
                    p={10} 
                    shadow="md" 
                    borderWidth="1px" 
                    borderRadius="lg" 
                    bg={cardBg}
                    h="full"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    textAlign="center"
                    _hover={{ transform: 'translateY(-5px)', transition: 'transform 0.2s' }}
                  >
                    <Icon as={FiShield} w={12} h={12} color="purple.500" mb={6} />
                    <Heading as="h3" size="lg" mb={4}>Secure Platform</Heading>
                    <Text color="gray.600" fontSize="lg" flex="1" display="flex" alignItems="center">Enterprise-grade security with JWT authentication</Text>
                  </Box>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Box 
                    p={10} 
                    shadow="md" 
                    borderWidth="1px" 
                    borderRadius="lg" 
                    bg={cardBg}
                    h="full"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    textAlign="center"
                    _hover={{ transform: 'translateY(-5px)', transition: 'transform 0.2s' }}
                  >
                    <Icon as={FiTrendingUp} w={12} h={12} color="green.500" mb={6} />
                    <Heading as="h3" size="lg" mb={4}>Scalable Infrastructure</Heading>
                    <Text color="gray.600" fontSize="lg" flex="1" display="flex" alignItems="center">Easily scale your training with our cloud infrastructure</Text>
                  </Box>
                </motion.div>
              </SimpleGrid>
            </motion.div>
          </VStack>
        </Container>
      </Box>
      
      {/* Model Types Section */}
      <Box py={24}>
        <Container maxW="container.xl">
          <VStack spacing={16}>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <VStack spacing={6}>
                <Heading as="h2" size="2xl">Supported Model Types</Heading>
                <Text fontSize="xl" color="gray.600" maxW="2xl">
                  Choose from various model architectures optimized for different tasks
                </Text>
              </VStack>
            </motion.div>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={8} w="full">
                <motion.div variants={itemVariants}>
                  <Box 
                    p={10} 
                    shadow="lg" 
                    borderWidth="1px" 
                    borderRadius="lg" 
                    bg={cardBg}
                    h="full"
                    display="flex"
                    flexDirection="column"
                    textAlign="center"
                    _hover={{ transform: 'translateY(-10px)', transition: 'transform 0.3s' }}
                  >
                    <Icon as={FiCpu} w={16} h={16} color="teal.500" mb={6} />
                    <Heading as="h3" size="xl" mb={4}>RNN Models</Heading>
                    <Text color="gray.600" fontSize="lg" mb={6} flex="1" display="flex" alignItems="center">Perfect for sequence prediction tasks like time series analysis, NLP, and more. Supports LSTM, GRU, and vanilla RNN architectures.</Text>
                    <Button 
                      variant="outline" 
                      colorScheme="teal" 
                      size="lg"
                      onClick={() => router.push('/models')}
                    >
                      Learn More
                    </Button>
                  </Box>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Box 
                    p={10} 
                    shadow="lg" 
                    borderWidth="1px" 
                    borderRadius="lg" 
                    bg={cardBg}
                    h="full"
                    display="flex"
                    flexDirection="column"
                    textAlign="center"
                    _hover={{ transform: 'translateY(-10px)', transition: 'transform 0.3s' }}
                  >
                    <Icon as={FiDatabase} w={16} h={16} color="blue.500" mb={6} />
                    <Heading as="h3" size="xl" mb={4}>CNN Models</Heading>
                    <Text color="gray.600" fontSize="lg" mb={6} flex="1" display="flex" alignItems="center">Optimized for image processing, computer vision, and pattern recognition. Includes ResNet, Inception, and custom architectures.</Text>
                    <Button 
                      variant="outline" 
                      colorScheme="teal" 
                      size="lg"
                      onClick={() => router.push('/models')}
                    >
                      Learn More
                    </Button>
                  </Box>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Box 
                    p={10} 
                    shadow="lg" 
                    borderWidth="1px" 
                    borderRadius="lg" 
                    bg={cardBg}
                    h="full"
                    display="flex"
                    flexDirection="column"
                    textAlign="center"
                    _hover={{ transform: 'translateY(-10px)', transition: 'transform 0.3s' }}
                  >
                    <Icon as={FiActivity} w={16} h={16} color="purple.500" mb={6} />
                    <Heading as="h3" size="xl" mb={4}>GPT Models</Heading>
                    <Text color="gray.600" fontSize="lg" mb={6} flex="1" display="flex" alignItems="center">State-of-the-art transformers for text generation and language understanding. Supports GPT-2, GPT-3, and custom transformer models.</Text>
                    <Button 
                      variant="outline" 
                      colorScheme="teal" 
                      size="lg"
                      onClick={() => router.push('/models')}
                    >
                      Learn More
                    </Button>
                  </Box>
                </motion.div>
              </Grid>
            </motion.div>
            
            {/* Additional Models Section */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={8} w="full" mt={8}>
                <motion.div variants={itemVariants}>
                  <Box 
                    p={10} 
                    shadow="lg" 
                    borderWidth="1px" 
                    borderRadius="lg" 
                    bg={cardBg}
                    h="full"
                    display="flex"
                    flexDirection="column"
                    textAlign="center"
                    _hover={{ transform: 'translateY(-10px)', transition: 'transform 0.3s' }}
                  >
                    <Icon as={FiLayers} w={16} h={16} color="orange.500" mb={6} />
                    <Heading as="h3" size="xl" mb={4}>Transformer Models</Heading>
                    <Text color="gray.600" fontSize="lg" mb={6} flex="1" display="flex" alignItems="center">Advanced attention-based models for sequence-to-sequence tasks, including BERT, T5, and custom architectures.</Text>
                    <Button 
                      variant="outline" 
                      colorScheme="teal" 
                      size="lg"
                      onClick={() => router.push('/models')}
                    >
                      Learn More
                    </Button>
                  </Box>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Box 
                    p={10} 
                    shadow="lg" 
                    borderWidth="1px" 
                    borderRadius="lg" 
                    bg={cardBg}
                    h="full"
                    display="flex"
                    flexDirection="column"
                    textAlign="center"
                    _hover={{ transform: 'translateY(-10px)', transition: 'transform 0.3s' }}
                  >
                    <Icon as={FiGrid} w={16} h={16} color="red.500" mb={6} />
                    <Heading as="h3" size="xl" mb={4}>Reinforcement Learning</Heading>
                    <Text color="gray.600" fontSize="lg" mb={6} flex="1" display="flex" alignItems="center">Deep Q-Networks, Actor-Critic, and Policy Gradient methods for decision making and control tasks.</Text>
                    <Button 
                      variant="outline" 
                      colorScheme="teal" 
                      size="lg"
                      onClick={() => router.push('/models')}
                    >
                      Learn More
                    </Button>
                  </Box>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Box 
                    p={10} 
                    shadow="lg" 
                    borderWidth="1px" 
                    borderRadius="lg" 
                    bg={cardBg}
                    h="full"
                    display="flex"
                    flexDirection="column"
                    textAlign="center"
                    _hover={{ transform: 'translateY(-10px)', transition: 'transform 0.3s' }}
                  >
                    <Icon as={FiBarChart2} w={16} h={16} color="green.500" mb={6} />
                    <Heading as="h3" size="xl" mb={4}>AutoML & Ensembles</Heading>
                    <Text color="gray.600" fontSize="lg" mb={6} flex="1" display="flex" alignItems="center">Automated machine learning and ensemble methods combining multiple models for superior performance.</Text>
                    <Button 
                      variant="outline" 
                      colorScheme="teal" 
                      size="lg"
                      onClick={() => router.push('/models')}
                    >
                      Learn More
                    </Button>
                  </Box>
                </motion.div>
              </Grid>
            </motion.div>
          </VStack>
        </Container>
      </Box>
      
      {/* Why Choose Section */}
      <Box py={24} bg={useColorModeValue('gray.100', 'gray.700')}>
        <Container maxW="container.xl">
          <VStack spacing={16}>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <VStack spacing={6}>
                <Heading as="h2" size="2xl">Why Choose Epoch-ml?</Heading>
                <Text fontSize="xl" color="gray.600" maxW="2xl">
                  The most advanced platform for machine learning development
                </Text>
              </VStack>
            </motion.div>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                <VStack align="stretch" spacing={6}>
                  <motion.div variants={itemVariants}>
                    <Flex align="center" gap={6}>
                      <Icon as={FiZap} w={10} h={10} color="teal.500" />
                      <Box>
                        <Heading as="h3" size="lg">Lightning Fast Training</Heading>
                        <Text color="gray.600" fontSize="lg">Optimized infrastructure with GPU acceleration for the fastest training possible</Text>
                      </Box>
                    </Flex>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Flex align="center" gap={6}>
                      <Icon as={FiGlobe} w={10} h={10} color="blue.500" />
                      <Box>
                        <Heading as="h3" size="lg">Cloud Scalability</Heading>
                        <Text color="gray.600" fontSize="lg">Scale your models from small experiments to production with auto-scaling infrastructure</Text>
                      </Box>
                    </Flex>
                  </motion.div>
                </VStack>
                
                <VStack align="stretch" spacing={6}>
                  <motion.div variants={itemVariants}>
                    <Flex align="center" gap={6}>
                      <Icon as={FiLock} w={10} h={10} color="purple.500" />
                      <Box>
                        <Heading as="h3" size="lg">Enterprise Security</Heading>
                        <Text color="gray.600" fontSize="lg">Military-grade encryption, secure model storage, and compliance with industry standards</Text>
                      </Box>
                    </Flex>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Flex align="center" gap={6}>
                      <Icon as={FiServer} w={10} h={10} color="green.500" />
                      <Box>
                        <Heading as="h3" size="lg">Managed Infrastructure</Heading>
                        <Text color="gray.600" fontSize="lg">No need to manage servers, GPUs, or complex ML infrastructure - we handle it all</Text>
                      </Box>
                    </Flex>
                  </motion.div>
                </VStack>
              </SimpleGrid>
            </motion.div>
          </VStack>
        </Container>
      </Box>
      
      {/* CTA Section */}
      <Box py={28}>
        <Container maxW="container.xl" textAlign="center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <VStack spacing={8}>
              <Heading as="h2" size="2xl">Ready to Get Started?</Heading>
              <Text fontSize="xl" color="gray.600" maxW="xl">
                Join thousands of data scientists and developers using Epoch-ml to build the future of AI
              </Text>
              
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Flex 
                  direction={{ base: 'column', md: 'row' }} 
                  gap={6} 
                  justify="center" 
                  mt={8}
                >
                  <Button 
                    colorScheme="teal" 
                    size="lg" 
                    px={10}
                    py={6}
                    fontSize="lg"
                    onClick={() => router.push('/register')}
                    leftIcon={<FiZap />}
                    as={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Create Free Account
                  </Button>
                  <Button 
                    variant="outline" 
                    colorScheme="teal" 
                    size="lg"
                    px={10}
                    py={6}
                    fontSize="lg"
                    onClick={() => router.push('/models')}
                    as={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Explore Models
                  </Button>
                </Flex>
              </motion.div>
            </VStack>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}