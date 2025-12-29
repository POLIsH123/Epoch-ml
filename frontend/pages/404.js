import { Box, Heading, Text, Button, VStack, Container, Flex, Icon, useColorModeValue, Grid } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { FiHome, FiSearch, FiZap, FiCpu, FiDatabase, FiBarChart2, FiActivity } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Custom404() {
  const router = useRouter();
  const bg = useColorModeValue('gray.900', 'gray.900');
  const textColor = useColorModeValue('white', 'white');

  return (
    <Box minH="100vh" bg={bg} color={textColor} position="relative" overflow="hidden">
      {/* Animated background grid */}
      <Box position="absolute" top="0" left="0" right="0" bottom="0" overflow="hidden" zIndex="0">
        {/* Grid lines */}
        <Box position="absolute" top="0" left="0" right="0" bottom="0" backgroundImage={`
          linear-gradient(rgba(0, 255, 200, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 200, 0.05) 1px, transparent 1px)
        `}
        backgroundSize="50px 50px" />
        
        {/* Animated dots */}
        {[...Array(30)].map((_, i) => (
          <Box
            key={i}
            position="absolute"
            width="4px"
            height="4px"
            borderRadius="50%"
            bg="teal.400"
            left={`${Math.random() * 100}%`}
            top={`${Math.random() * 100}%`}
            animation={`pulse 2s infinite ${Math.random() * 2}s`}
          />
        ))}
        
        {/* Moving particles */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: '2px',
              height: '20px',
              background: 'linear-gradient(to bottom, #00d9ff, #00ffaa)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 2,
            }}
          />
        ))}
      </Box>

      <Container maxW="container.md" centerContent>
        <VStack spacing={8} align="center" py={20} position="relative" zIndex="1">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: 'spring' }}
          >
            <Box className="glass" p={10} borderRadius="2xl" borderWidth="1px" borderColor="teal.500" position="relative">
              {/* Animated border effect */}
              <Box
                position="absolute"
                top="-2px" left="-2px" right="-2px" bottom="-2px"
                borderRadius="2xl"
                bgGradient="linear(45deg, teal.400, blue.500, purple.500, pink.500)"
                zIndex="-1"
                animation="spin 4s linear infinite"
              />
              
              <Flex direction="column" align="center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                >
                  <Icon as={FiZap} w={24} h={24} color="teal.400" mb={6} />
                </motion.div>
                
                <Heading size="3xl" bgGradient="linear(to-r, teal.300, blue.400, purple.400)" bgClip="text" mb={4}>
                  404
                </Heading>
                <Text fontSize="xl" color="gray.300" textAlign="center" mb={2}>
                  Neural pathway not found
                </Text>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  Sector {Math.floor(Math.random() * 9999).toString(16).toUpperCase()} is offline
                </Text>
              </Flex>
            </Box>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <VStack spacing={6} align="center" textAlign="center" maxW="lg">
              <Heading size="lg" color="teal.300">
                ACCESS DENIED
              </Heading>
              <Text fontSize="md" color="gray.400">
                The neural architecture you're trying to access does not exist in the mainframe. 
                This sector has been quarantined from the network and marked as restricted access.
              </Text>
              
              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full" mt={6}>
                <Button
                  leftIcon={<FiHome />}
                  onClick={() => router.push('/')}
                  colorScheme="teal"
                  variant="outline"
                  borderRadius="full"
                  px={6}
                >
                  Return to Mainframe
                </Button>
                
                <Button
                  leftIcon={<FiSearch />}
                  onClick={() => router.push('/models')}
                  colorScheme="blue"
                  variant="outline"
                  borderRadius="full"
                  px={6}
                >
                  Browse Neural Cores
                </Button>
              </Grid>
              
              <Flex gap={6} mt={4}>
                <Flex align="center" gap={2}>
                  <Icon as={FiCpu} color="teal.400" />
                  <Text fontSize="xs" color="gray.500">CORES: 0/64 ONLINE</Text>
                </Flex>
                <Flex align="center" gap={2}>
                  <Icon as={FiDatabase} color="blue.400" />
                  <Text fontSize="xs" color="gray.500">DATA: 0.00 TB</Text>
                </Flex>
              </Flex>
            </VStack>
          </motion.div>
        </VStack>
      </Container>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        
        .glass {
          background: rgba(30, 30, 50, 0.2);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          position: relative;
          overflow: hidden;
        }
      `}</style>
    </Box>
  );
}