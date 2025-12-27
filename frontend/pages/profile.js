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
                <Flex align="center" gap={3}>
                  <Box p={3} bg="teal.100" borderRadius="md">
                    <Flex align="center" gap={2}>
                      <Icon as={FiDollarSign} color="teal.500" />
                      <Text fontWeight="bold">{user?.credits || 100} credits</Text>
                    </Flex>
                  </Box>
                  <Button
                    colorScheme="teal"
                    size="sm"
                    leftIcon={<FiZap />}
                    onClick={async () => {
                      // For demo purposes, we'll call a mock top-up
                      try {
                        const response = await fetch('http://localhost:5001/api/auth/profile/topup', {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        });
                        if (response.ok) {
                          const data = await response.json();
                          setUser(prev => ({ ...prev, credits: data.credits }));
                          toast({ title: 'Credits added', status: 'success' });
                        }
                      } catch (e) { }
                    }}
                  >
                    Top Up
                  </Button>
                </Flex>
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
                <Flex justify="space-between" align="center">
                  <Flex align="center">
                    <Icon as={FiUser} w={6} h={6} color="teal.500" mr={3} />
                    <Heading as="h3" size="md">Profile Information</Heading>
                  </Flex>
                  <Button
                    leftIcon={<FiEdit2 />}
                    colorScheme="teal"
                    variant="outline"
                    onClick={handleEditToggle}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                  <FormControl id="username">
                    <FormLabel>Username</FormLabel>
                    <Input
                      value={editData.username}
                      onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                      isDisabled={!isEditing}
                    />
                  </FormControl>

                  <FormControl id="email">
                    <FormLabel>Email</FormLabel>
                    <Input
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      isDisabled={!isEditing}
                    />
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

                {isEditing && (
                  <Flex justify="flex-end" mt={6} gap={3}>
                    <Button
                      colorScheme="gray"
                      onClick={handleEditToggle}
                    >
                      Cancel
                    </Button>
                    <Button
                      colorScheme="teal"
                      onClick={handleUpdateProfile}
                    >
                      Save Changes
                    </Button>
                  </Flex>
                )}
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
                        <Text fontWeight="bold">{stats.completedSessions}</Text>
                        <Text fontSize="sm">Models Created</Text>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <VStack align="center">
                        <Icon as={FiClock} w={8} h={8} color="teal.500" />
                        <Text fontWeight="bold">{stats.totalSessions}</Text>
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