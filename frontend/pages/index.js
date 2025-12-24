import { Box, Heading, Text, Button, VStack, Container, Grid, GridItem, Flex, Icon, useColorModeValue } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { FiCpu, FiBarChart2, FiDatabase, FiActivity, FiZap, FiShield } from 'react-icons/fi';

export default function Home() {
  const router = useRouter();
  
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  
  return (
    <Box minH="100vh" bg={bg}>
      <Container maxW="container.xl" py={12}>
        <VStack spacing={12} align="center" textAlign="center">
          <VStack spacing={6}>
            <Heading as="h1" size="2xl" bgGradient="linear(to-r, teal.400, blue.500)" bgClip="text">
              Epoch-ml
            </Heading>
            <Text fontSize="xl" maxW="3xl" color="gray.600">
              The next-generation machine learning platform that enables you to train, deploy, and manage AI models with ease.
            </Text>
          </VStack>
          
          <Flex direction={{ base: 'column', md: 'row' }} gap={6} w="full" justify="center">
            <Button 
              colorScheme="teal" 
              size="lg" 
              px={8}
              onClick={() => router.push('/register')}
              leftIcon={<FiZap />}
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              colorScheme="teal" 
              size="lg"
              px={8}
              onClick={() => router.push('/login')}
            >
              Login
            </Button>
          </Flex>
          
          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6} mt={8} w="full">
            <Box p={6} shadow="lg" borderWidth="1px" borderRadius="lg" bg={cardBg}>
              <Icon as={FiCpu} w={10} h={10} color="teal.500" mb={4} />
              <Heading as="h3" size="md" mb={2}>RNN Models</Heading>
              <Text color="gray.600">Train Recurrent Neural Networks for sequence prediction tasks</Text>
            </Box>
            <Box p={6} shadow="lg" borderWidth="1px" borderRadius="lg" bg={cardBg}>
              <Icon as={FiDatabase} w={10} h={10} color="blue.500" mb={4} />
              <Heading as="h3" size="md" mb={2}>CNN Models</Heading>
              <Text color="gray.600">Build Convolutional Neural Networks for image processing</Text>
            </Box>
            <Box p={6} shadow="lg" borderWidth="1px" borderRadius="lg" bg={cardBg}>
              <Icon as={FiActivity} w={10} h={10} color="purple.500" mb={4} />
              <Heading as="h3" size="md" mb={2}>GPT Models</Heading>
              <Text color="gray.600">Create Generative Pre-trained Transformers for text generation</Text>
            </Box>
          </Grid>
          
          <VStack spacing={4} mt={12} w="full">
            <Heading as="h2" size="lg">Powerful Features</Heading>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4} w="full">
              <Flex align="center" gap={3}>
                <Icon as={FiBarChart2} color="green.500" />
                <Text>Real-time training visualization</Text>
              </Flex>
              <Flex align="center" gap={3}>
                <Icon as={FiShield} color="green.500" />
                <Text>Secure authentication</Text>
              </Flex>
              <Flex align="center" gap={3}>
                <Icon as={FiZap} color="green.500" />
                <Text>Scalable infrastructure</Text>
              </Flex>
              <Flex align="center" gap={3}>
                <Icon as={FiCpu} color="green.500" />
                <Text>Optimized performance</Text>
              </Flex>
            </Grid>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}