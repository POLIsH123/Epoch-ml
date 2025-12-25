import { Box, Heading, Text, Button, VStack, Container, Card, CardHeader, CardBody, Flex, Icon, useColorModeValue, useToast, Switch, FormControl, FormLabel, Select } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiSettings, FiUser, FiMail, FiLock, FiBell, FiGlobe, FiSun, FiMoon } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
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
  
  const handleSaveSettings = () => {
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
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
                <Heading as="h1" size="lg">Settings</Heading>
                <Text color="gray.500">Manage your account preferences</Text>
              </VStack>
              <Flex align="center" gap={4}>
                <Box p={3} bg="teal.100" borderRadius="md">
                  <Flex align="center" gap={2}>
                    <Icon as={FiUser} color="teal.500" />
                    <Text fontWeight="bold">{user?.username}</Text>
                  </Flex>
                </Box>
              </Flex>
            </Flex>
          </motion.div>
          
          {/* Account Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card bg={cardBg}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiUser} w={6} h={6} color="teal.500" mr={3} />
                  <Heading as="h3" size="md">Account Settings</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <FormControl display="flex" alignItems="center" justifyContent="space-between">
                    <Flex align="center">
                      <Icon as={FiMail} w={5} h={5} mr={3} color="teal.500" />
                      <FormLabel htmlFor="email-updates" mb="0">
                        Email Updates
                      </FormLabel>
                    </Flex>
                    <Switch 
                      id="email-updates" 
                      isChecked={emailUpdates}
                      onChange={(e) => setEmailUpdates(e.target.checked)}
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center" justifyContent="space-between">
                    <Flex align="center">
                      <Icon as={FiBell} w={5} h={5} mr={3} color="teal.500" />
                      <FormLabel htmlFor="notifications" mb="0">
                        Push Notifications
                      </FormLabel>
                    </Flex>
                    <Switch 
                      id="notifications" 
                      isChecked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center" justifyContent="space-between">
                    <Flex align="center">
                      <Icon as={FiGlobe} w={5} h={5} mr={3} color="teal.500" />
                      <FormLabel htmlFor="auto-save" mb="0">
                        Auto Save Models
                      </FormLabel>
                    </Flex>
                    <Switch 
                      id="auto-save" 
                      isChecked={autoSave}
                      onChange={(e) => setAutoSave(e.target.checked)}
                    />
                  </FormControl>
                  
                  <Flex justify="flex-end">
                    <Button colorScheme="teal" onClick={handleSaveSettings}>
                      Save Settings
                    </Button>
                  </Flex>
                </VStack>
              </CardBody>
            </Card>
          </motion.div>
          
          {/* Theme Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card bg={cardBg}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiSun} w={6} h={6} color="teal.500" mr={3} />
                  <Heading as="h3" size="md">Theme Settings</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <FormControl>
                    <FormLabel>Theme</FormLabel>
                    <Select defaultValue="system">
                      <option value="system">System</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Language</FormLabel>
                    <Select defaultValue="en">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </Select>
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </motion.div>
          
          {/* Security Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card bg={cardBg}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiLock} w={6} h={6} color="teal.500" mr={3} />
                  <Heading as="h3" size="md">Security Settings</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Button variant="outline" colorScheme="red" leftIcon={<Icon as={FiLock} />}>
                    Change Password
                  </Button>
                  <Button variant="outline" colorScheme="red" leftIcon={<Icon as={FiUser} />}>
                    Two-Factor Authentication
                  </Button>
                  <Button variant="outline" colorScheme="red" leftIcon={<Icon as={FiSettings} />}>
                    Manage API Keys
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </motion.div>
        </VStack>
      </Box>
    </Box>
  );
}