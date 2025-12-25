import { Box, Heading, Text, Button, VStack, Container, Card, CardHeader, CardBody, Flex, Icon, useColorModeValue, useToast, Grid, Stat, StatLabel, StatNumber, StatHelpText, StatGroup, FormControl, FormLabel, Input } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiUser, FiMail, FiLock, FiBarChart2, FiDollarSign, FiClock, FiActivity } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const toast = useToast();
  
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Verify token is valid by making a simple API call
    fetch('http://localhost:5001/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (res.status === 401) {
        // Token is invalid, redirect to login
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      return res.json();
    })
    .then(data => {
      if (data) {
        setUser(data);
        setLoading(false);
      }
    })
    .catch(err => {
      console.error('Error fetching user data:', err);
      localStorage.removeItem('token');
      router.push('/login');
    });
  }, [router]);
  
  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={bg}>
        <Text>Loading...</Text>
      </Flex>
    );
  }
  
  return (
    <Box minH="100vh" bg={bg}>
      <Sidebar user={user} />
      <Box ml="250px" p={6}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Flex justify="space-between" align="center">
              <VStack align="start" spacing={2}>
                <Heading as="h1" size="lg">User Profile</Heading>
                <Text color="gray.500">Manage your account settings</Text>
              </VStack>
              <Flex align="center" gap={4}>
                <Box p={3} bg="teal.100" borderRadius="md">
                  <Flex align="center" gap={2}>
                    <Icon as={FiDollarSign} color="teal.500" />
                    <Text fontWeight="bold">{user?.credits || 100} credits</Text>
                  </Flex>
                </Box>
              </Flex>
            </Flex>
          </motion.div>
          
          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StatGroup>
              <Stat>
                <StatLabel>Username</StatLabel>
                <StatNumber>{user?.username}</StatNumber>
                <StatHelpText>Your account name</StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Email</StatLabel>
                <StatNumber>{user?.email}</StatNumber>
                <StatHelpText>Your registered email</StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Member Since</StatLabel>
                <StatNumber>{new Date(user?.createdAt).getFullYear()}</StatNumber>
                <StatHelpText>Account creation date</StatHelpText>
              </Stat>
            </StatGroup>
          </motion.div>
          
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card bg={cardBg}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiUser} w={6} h={6} color="teal.500" mr={3} />
                  <Heading as="h3" size="md">Profile Information</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                  <FormControl id="username">
                    <FormLabel>Username</FormLabel>
                    <Input value={user?.username || ''} isDisabled />
                  </FormControl>
                  
                  <FormControl id="email">
                    <FormLabel>Email</FormLabel>
                    <Input value={user?.email || ''} isDisabled />
                  </FormControl>
                  
                  <FormControl id="role">
                    <FormLabel>Role</FormLabel>
                    <Input value={user?.role || ''} isDisabled />
                  </FormControl>
                  
                  <FormControl id="createdAt">
                    <FormLabel>Member Since</FormLabel>
                    <Input value={new Date(user?.createdAt).toLocaleDateString() || ''} isDisabled />
                  </FormControl>
                </Grid>
                
                <Flex justify="flex-end" mt={6}>
                  <Button colorScheme="teal">Update Profile</Button>
                </Flex>
              </CardBody>
            </Card>
          </motion.div>
          
          {/* Account Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card bg={cardBg}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiActivity} w={6} h={6} color="blue.500" mr={3} />
                  <Heading as="h3" size="md">Account Statistics</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
                  <Card>
                    <CardBody>
                      <VStack align="center">
                        <Icon as={FiBarChart2} w={8} h={8} color="teal.500" />
                        <Text fontWeight="bold">0</Text>
                        <Text fontSize="sm">Models Created</Text>
                      </VStack>
                    </CardBody>
                  </Card>
                  
                  <Card>
                    <CardBody>
                      <VStack align="center">
                        <Icon as={FiClock} w={8} h={8} color="teal.500" />
                        <Text fontWeight="bold">0</Text>
                        <Text fontSize="sm">Training Sessions</Text>
                      </VStack>
                    </CardBody>
                  </Card>
                  
                  <Card>
                    <CardBody>
                      <VStack align="center">
                        <Icon as={FiDollarSign} w={8} h={8} color="teal.500" />
                        <Text fontWeight="bold">{user?.credits || 100}</Text>
                        <Text fontSize="sm">Available Credits</Text>
                      </VStack>
                    </CardBody>
                  </Card>
                </Grid>
              </CardBody>
            </Card>
          </motion.div>
        </VStack>
      </Box>
    </Box>
  );
}