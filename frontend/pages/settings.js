import { Box, Heading, Text, Button, VStack, Container, Card, CardBody, Flex, Icon, useColorMode, useColorModeValue, useToast, Switch, FormControl, FormLabel } from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { FiSun, FiMoon, FiUserX, FiShield, FiLogOut } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

export default function Settings() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const toast = useToast();

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  // Load user data
  useState(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch('http://localhost:5001/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        return res.json();
      })
      .then(userData => {
        if (userData) {
          setUser(userData);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Error fetching user data:', err);
        localStorage.removeItem('token');
        router.push('/login');
      });
  });

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/users/${user._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        localStorage.removeItem('token');
        toast({
          title: 'Account deleted',
          description: 'Your account has been permanently deleted.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        router.push('/register');
      } else {
        const data = await response.json();
        toast({
          title: 'Deletion failed',
          description: data.error || 'Could not delete account',
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
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
            <Flex justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Heading as="h1" size="xl" bgGradient="linear(to-r, teal.300, blue.400)" bgClip="text">
                  Account Settings
                </Heading>
                <Text color="gray.500" fontSize="lg">Manage your account preferences and security.</Text>
              </VStack>
            </Flex>
          </motion.div>

          {/* Theme Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="glass" bg={cardBg}>
              <CardBody>
                <VStack align="stretch" spacing={6}>
                  <Heading size="md" color="teal.300">Appearance</Heading>
                  
                  <FormControl display="flex" alignItems="center" justifyContent="space-between">
                    <Flex align="center">
                      <Icon as={colorMode === 'light' ? FiSun : FiMoon} w={5} h={5} mr={3} color={colorMode === 'light' ? 'yellow.400' : 'purple.400'} />
                      <FormLabel htmlFor="theme-switch" mb="0">
                        <Text fontWeight="medium">Dark Mode</Text>
                        <Text fontSize="sm" color="gray.500">Toggle between light and dark themes</Text>
                      </FormLabel>
                    </Flex>
                    <Switch 
                      id="theme-switch" 
                      size="lg"
                      isChecked={colorMode === 'dark'}
                      onChange={toggleColorMode}
                      colorScheme="teal"
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </motion.div>

          {/* Account Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="glass" bg={cardBg}>
              <CardBody>
                <VStack align="stretch" spacing={6}>
                  <Heading size="md" color="teal.300">Account Management</Heading>
                  
                  <Flex justify="space-between" align="center" p={4} bg="rgba(255, 0, 0, 0.05)" borderRadius="md" border="1px solid" borderColor="red.500">
                    <Flex align="center">
                      <Icon as={FiUserX} w={6} h={6} mr={3} color="red.400" />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" color="red.400">Delete Account</Text>
                        <Text fontSize="sm" color="gray.500">Permanently remove your account and all data</Text>
                      </VStack>
                    </Flex>
                    <Button
                      colorScheme="red"
                      variant="outline"
                      onClick={handleDeleteAccount}
                      leftIcon={<FiUserX />}
                    >
                      Delete Account
                    </Button>
                  </Flex>
                  
                  <Flex justify="space-between" align="center" p={4} bg="rgba(255, 165, 0, 0.05)" borderRadius="md" border="1px solid" borderColor="orange.500">
                    <Flex align="center">
                      <Icon as={FiLogOut} w={6} h={6} mr={3} color="orange.400" />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" color="orange.400">Sign Out</Text>
                        <Text fontSize="sm" color="gray.500">End your current session</Text>
                      </VStack>
                    </Flex>
                    <Button
                      colorScheme="orange"
                      variant="outline"
                      onClick={handleLogout}
                      leftIcon={<FiLogOut />}
                    >
                      Sign Out
                    </Button>
                  </Flex>
                </VStack>
              </CardBody>
            </Card>
          </motion.div>

          {/* Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="glass" bg={cardBg}>
              <CardBody>
                <VStack align="stretch" spacing={6}>
                  <Heading size="md" color="teal.300">Security</Heading>
                  
                  <Flex justify="space-between" align="center" p={4} bg="rgba(0, 255, 0, 0.05)" borderRadius="md" border="1px solid" borderColor="green.500">
                    <Flex align="center">
                      <Icon as={FiShield} w={6} h={6} mr={3} color="green.400" />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" color="green.400">Password Change</Text>
                        <Text fontSize="sm" color="gray.500">Update your account password</Text>
                      </VStack>
                    </Flex>
                    <Button
                      colorScheme="green"
                      variant="outline"
                      isDisabled // Feature not implemented yet
                    >
                      Change Password
                    </Button>
                  </Flex>
                </VStack>
              </CardBody>
            </Card>
          </motion.div>
        </VStack>
      </Box>
    </Box>
  );
}