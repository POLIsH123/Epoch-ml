import { Box, Heading, Text, Button, VStack, Container, Flex, Icon, useColorModeValue } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { FiHome, FiSearch, FiZap } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Custom404() {
  const router = useRouter();
  const bg = useColorModeValue('gray.900', 'gray.900');
  const textColor = useColorModeValue('white', 'white');

  return (
    <Box minH="100vh" bg={bg} color={textColor} position="relative" overflow="hidden">
      {/* Animated background elements */}
      <Box position="absolute" top="0" left="0" right="0" bottom="0" overflow="hidden" zIndex="0">
        {[...Array(20)].map((_, i) => (
          <Box
            key={i}
            position="absolute"
            width="2px"
            height="20px"
            bgGradient="linear(to-b, teal.400, blue.500)"
            left={`${Math.random() * 100}%`}
            top={`${Math.random() * 100}%`}
            animation={`pulse ${2 + Math.random() * 3}s infinite ${Math.random() * 2}s`}
          />
        ))}
      </Box>

      <Container maxW="container.md" centerContent>
        <VStack spacing={8} align="center" py={20} position="relative" zIndex="1">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: 'spring' }}
          >
            <Box className="glass" p={8} borderRadius="2xl" borderWidth="1px" borderColor="teal.500">
              <Flex direction="column" align="center">
                <Icon as={FiZap} w={20} h={20} color="teal.400" mb={4} />
                <Heading size="2xl" bgGradient="linear(to-r, teal.300, blue.400)" bgClip="text" mb={2}>
                  404
                </Heading>
                <Text fontSize="lg" color="gray.400" textAlign="center">
                  Neural pathway not found
                </Text>
              </Flex>
            </Box>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <VStack spacing={6} align="center" textAlign="center">
              <Heading size="lg" color="teal.300">
                Access Denied
              </Heading>
              <Text fontSize="md" color="gray.500" maxW="md">
                The neural architecture you're trying to access does not exist in the mainframe. 
                This sector has been quarantined from the network.
              </Text>
              
              <Flex gap={4} mt={4}>
                <Button
                  leftIcon={<FiHome />}
                  onClick={() => router.push('/')}
                  colorScheme="teal"
                  variant="outline"
                  borderRadius="full"
                  px={8}
                >
                  Return to Mainframe
                </Button>
                
                <Button
                  leftIcon={<FiSearch />}
                  onClick={() => router.push('/models')}
                  colorScheme="blue"
                  variant="outline"
                  borderRadius="full"
                  px={8}
                >
                  Browse Neural Cores
                </Button>
              </Flex>
            </VStack>
          </motion.div>
        </VStack>
      </Container>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(1.5); }
        }
        
        .glass {
          background: rgba(30, 30, 50, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </Box>
  );
}