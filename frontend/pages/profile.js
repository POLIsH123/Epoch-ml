import { Box, Heading, Text, Button, VStack, Container, Card, CardHeader, CardBody, Flex, Icon, useColorModeValue, useToast, Grid, Stat, StatLabel, StatNumber, StatHelpText, StatGroup, FormControl, FormLabel, Input, useDisclosure } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiUser, FiMail, FiLock, FiBarChart2, FiDollarSign, FiClock, FiActivity, FiEdit2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({ totalSessions: 0, completedSessions: 0 });
  const [editData, setEditData] = useState({ username: '', email: '' });
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

    // Verify token and fetch data
    Promise.all([
      fetch('http://localhost:5001/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch('http://localhost:5001/api/training/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ])
      .then(async ([profileRes, statsRes]) => {
        if (profileRes.status === 401 || statsRes.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        const userData = await profileRes.json();
        const statsData = await statsRes.json();

        setUser(userData);
        setEditData({ username: userData.username, email: userData.email });
        setStats(statsData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
  }, [router]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing, reset to original values
      setEditData({ username: user.username, email: user.email });
    }
    setIsEditing(!isEditing);
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          username: editData.username,
          email: editData.email
        })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setIsEditing(false);
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Update failed',
          description: data.error || 'Could not update profile',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: 'Network error',
        description: 'Please check your connection and try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

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
      <Box ml="250px" p={8}>
        <VStack spacing={10} align="stretch">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Flex justify="space-between" align="center" mb={6}>
              <VStack align="start" spacing={1}>
                <Heading as="h1" size="xl" bgGradient="linear(to-r, teal.300, blue.400)" bgClip="text">
                  User Architecture
                </Heading>
                <Text color="gray.500" fontSize="lg">Manage your Neural Profile and identity.</Text>
              </VStack>
              <Button
                leftIcon={<FiEdit2 />}
                onClick={handleEditToggle}
                className="glass"
                colorScheme={isEditing ? 'red' : 'teal'}
                variant="outline"
                px={8}
                borderRadius="full"
              >
                {isEditing ? 'Cancel Edit' : 'Modify Profile'}
              </Button>
            </Flex>
          </motion.div>

          <Grid templateColumns={{ base: '1fr', lg: '1fr 2fr' }} gap={8}>
            {/* Identity Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Box className="glass" p={8} textAlign="center">
                <Box
                  w={24}
                  h={24}
                  bgGradient="linear(to-tr, teal.400, blue.500)"
                  borderRadius="full"
                  mx="auto"
                  mb={6}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="0 0 20px rgba(45, 212, 191, 0.4)"
                >
                  <Icon as={FiUser} w={12} h={12} color="white" />
                </Box>
                <Heading size="md" mb={2}>{user?.username}</Heading>
                <Text color="gray.500" mb={6}>{user?.email}</Text>

                <VStack spacing={4} align="stretch" mt={6}>
                  <Flex justify="space-between" align="center" px={4} py={2} bg="rgba(255,255,255,0.05)" borderRadius="md">
                    <Text fontSize="sm" color="gray.400">STATUS</Text>
                    <Badge colorScheme="green" variant="subtle">ACTIVE</Badge>
                  </Flex>
                  <Flex justify="space-between" align="center" px={4} py={2} bg="rgba(255,255,255,0.05)" borderRadius="md">
                    <Text fontSize="sm" color="gray.400">CREDITS</Text>
                    <Text fontWeight="bold" color="teal.300">{(user?.credits || 0).toLocaleString()} CR</Text>
                  </Flex>
                </VStack>
              </Box>
            </motion.div>

            {/* Profile Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Box className="glass" p={8}>
                <VStack spacing={6} align="stretch">
                  <Heading size="sm" color="teal.400" textTransform="uppercase" letterSpacing="wider">
                    Core Configuration
                  </Heading>

                  <FormControl id="username">
                    <FormLabel>Neural Identity (Username)</FormLabel>
                    <Input
                      value={editData.username}
                      onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                      isDisabled={!isEditing}
                      bg="rgba(0,0,0,0.1)"
                      border="none"
                      _disabled={{ opacity: 0.6 }}
                      _focus={{ ring: '1px solid', ringColor: 'teal.400' }}
                    />
                  </FormControl>

                  <FormControl id="email">
                    <FormLabel>Comm Link (Email Address)</FormLabel>
                    <Input
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      isDisabled={!isEditing}
                      bg="rgba(0,0,0,0.1)"
                      border="none"
                      _disabled={{ opacity: 0.6 }}
                      _focus={{ ring: '1px solid', ringColor: 'teal.400' }}
                    />
                  </FormControl>

                  {isEditing && (
                    <Button
                      mt={4}
                      colorScheme="teal"
                      onClick={handleUpdateProfile}
                      borderRadius="full"
                      bgGradient="linear(to-r, teal.400, blue.500)"
                      _hover={{ bgGradient: 'linear(to-r, teal.500, blue.600)' }}
                      transition="all 0.3s"
                    >
                      Apply Synchronization
                    </Button>
                  )}

                  <Divider borderColor="whiteAlpha.100" my={4} />

                  <Heading size="sm" color="blue.400" textTransform="uppercase" letterSpacing="wider">
                    Metrics & Statistics
                  </Heading>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Box p={4} bg="rgba(255,255,255,0.03)" borderRadius="lg" border="1px solid" borderColor="whiteAlpha.100">
                      <Flex align="center" gap={3}>
                        <Icon as={FiClock} color="orange.400" />
                        <Box>
                          <Text fontSize="xs" color="gray.500">TOTAL SESSIONS</Text>
                          <Text fontWeight="bold">{stats.totalSessions || 0}</Text>
                        </Box>
                      </Flex>
                    </Box>
                    <Box p={4} bg="rgba(255,255,255,0.03)" borderRadius="lg" border="1px solid" borderColor="whiteAlpha.100">
                      <Flex align="center" gap={3}>
                        <Icon as={FiActivity} color="green.400" />
                        <Box>
                          <Text fontSize="xs" color="gray.500">COMPLETED</Text>
                          <Text fontWeight="bold">{stats.completedSessions || 0}</Text>
                        </Box>
                      </Flex>
                    </Box>
                  </SimpleGrid>

                  <Box p={4} bg="rgba(255,255,255,0.03)" borderRadius="lg" border="1px solid" borderColor="whiteAlpha.100">
                    <Flex justify="space-between" align="center">
                      <HStack>
                        <Icon as={FiLock} color="blue.400" />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold" fontSize="sm">Security Protocols</Text>
                          <Text fontSize="xs" color="gray.500">Managed via Cluster Gateway</Text>
                        </VStack>
                      </HStack>
                      <Button variant="ghost" size="sm" colorScheme="blue">Advanced</Button>
                    </Flex>
                  </Box>
                </VStack>
              </Box>
            </motion.div>
          </Grid>
        </VStack>
      </Box>
    </Box>
  );
}