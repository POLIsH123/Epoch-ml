import { Box, Heading, Text, Button, VStack, Container, Grid, GridItem } from '@chakra-ui/react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  
  return (
    <Container maxW="container.xl" py={12}>
      <VStack spacing={8} align="center" textAlign="center">
        <Heading as="h1" size="2xl" color="teal.600">
          Welcome to Epoch-ml
        </Heading>
        <Text fontSize="xl" maxW="2xl">
          The interactive machine learning platform that enables you to train various AI models with customizable parameters.
        </Text>
        
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6} mt={8}>
          <GridItem p={6} shadow="md" borderWidth="1px" borderRadius="md">
            <Heading as="h3" size="md" mb={2}>RNN Models</Heading>
            <Text>Train Recurrent Neural Networks for sequence prediction tasks</Text>
          </GridItem>
          <GridItem p={6} shadow="md" borderWidth="1px" borderRadius="md">
            <Heading as="h3" size="md" mb={2}>CNN Models</Heading>
            <Text>Build Convolutional Neural Networks for image processing</Text>
          </GridItem>
          <GridItem p={6} shadow="md" borderWidth="1px" borderRadius="md">
            <Heading as="h3" size="md" mb={2}>GPT Models</Heading>
            <Text>Create Generative Pre-trained Transformers for text generation</Text>
          </GridItem>
        </Grid>
        
        <Box mt={8}>
          <Button 
            colorScheme="teal" 
            size="lg" 
            mr={4}
            onClick={() => router.push('/register')}
          >
            Get Started
          </Button>
          <Button 
            variant="outline" 
            colorScheme="teal" 
            size="lg"
            onClick={() => router.push('/login')}
          >
            Login
          </Button>
        </Box>
      </VStack>
    </Container>
  );
}
