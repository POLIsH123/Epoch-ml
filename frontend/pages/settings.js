import { Box, Heading, Text, Button, VStack, Container, Card, CardHeader, CardBody, Flex, Icon, useColorModeValue, useToast, Grid, FormControl, FormLabel, Input, Switch, Select, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiUser, FiMail, FiLock, FiBell, FiGlobe, FiSun, FiMoon, FiHardDrive, FiZap, FiDatabase } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    autoSave: true,
    performanceMode: 'balanced',
    storageLimit: '10GB'
  });
  const router = useRouter();
  const toast = useToast();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  
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
  
  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  const handleSaveSettings = () => {
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const handleChangePassword = () => {
    toast({
      title: 'Feature coming soon',
      description: 'Password change functionality will be available in a future update',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const handleUpdateProfile = () => {
    router.push('/profile');
  };
  
  const handleClearData = () => {
    toast({
      title: 'Feature coming soon',
      description: 'Data clearing functionality will be available in a future update',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const handleResetAccount = () => {
    toast({
      title: 'Feature coming soon',
      description: 'Account reset functionality will be available in a future update',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        router.push('/login');
        toast({
          title: 'Account deleted',
          description: 'Your account has been deleted successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Delete failed',
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
                <Text color="gray.500">Manage your account and application preferences</Text>
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
                
                <Flex justify="flex-end" mt={6} gap={3}>
                  <Button colorScheme="gray" variant="outline" onClick={handleChangePassword}>
                    Change Password
                  </Button>
                  <Button colorScheme="teal" leftIcon={<FiUser />} onClick={handleUpdateProfile}>
                    Update Profile
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          </motion.div>
          
          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card bg={cardBg}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiBell} w={6} h={6} color="purple.500" mr={3} />
                  <Heading as="h3" size="md">Notification Settings</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium">Enable Notifications</Text>
                      <Text fontSize="sm" color="gray.500">Receive updates about your training sessions</Text>
                    </VStack>
                    <Switch 
                      isChecked={settings.notifications} 
                      onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                      colorScheme="teal"
                    />
                  </Flex>
                  
                  <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium">Email Notifications</Text>
                      <Text fontSize="sm" color="gray.500">Get email updates when training completes</Text>
                    </VStack>
                    <Switch 
                      isChecked={settings.notifications} 
                      onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                      colorScheme="teal"
                    />
                  </Flex>
                </VStack>
              </CardBody>
            </Card>
          </motion.div>
          
          {/* Application Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card bg={cardBg}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiGlobe} w={6} h={6} color="blue.500" mr={3} />
                  <Heading as="h3" size="md">Application Settings</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                  <FormControl id="theme">
                    <FormLabel>Theme</FormLabel>
                    <Select 
                      value={settings.darkMode ? 'dark' : 'light'} 
                      onChange={(e) => handleSettingChange('darkMode', e.target.value === 'dark')}
                    >
                      <option value="light">Light Theme</option>
                      <option value="dark">Dark Theme</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl id="performance">
                    <FormLabel>Performance Mode</FormLabel>
                    <Select 
                      value={settings.performanceMode} 
                      onChange={(e) => handleSettingChange('performanceMode', e.target.value)}
                    >
                      <option value="balanced">Balanced</option>
                      <option value="performance">High Performance</option>
                      <option value="power">Power Saving</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl id="storage">
                    <FormLabel>Storage Limit</FormLabel>
                    <Select 
                      value={settings.storageLimit} 
                      onChange={(e) => handleSettingChange('storageLimit', e.target.value)}
                    >
                      <option value="1GB">1 GB</option>
                      <option value="5GB">5 GB</option>
                      <option value="10GB">10 GB</option>
                      <option value="50GB">50 GB</option>
                      <option value="100GB">100 GB</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl id="autoSave">
                    <FormLabel>Auto Save</FormLabel>
                    <Switch 
                      isChecked={settings.autoSave} 
                      onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                      colorScheme="teal"
                    />
                  </FormControl>
                </Grid>
                
                <Flex justify="flex-end" mt={6}>
                  <Button 
                    colorScheme="teal" 
                    leftIcon={<FiZap />}
                    onClick={handleSaveSettings}
                  >
                    Save Settings
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          </motion.div>
          
          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card bg={useColorModeValue('red.50', 'red.900')}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiDatabase} w={6} h={6} color="red.500" mr={3} />
                  <Heading as="h3" size="md">Danger Zone</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Text color={useColorModeValue('red.700', 'red.300')}>
                    These actions are irreversible. Please be careful when performing these operations.
                  </Text>
                  
                  <Flex gap={3} justify="flex-end">
                    <Button colorScheme="red" variant="outline" onClick={handleClearData}>
                      Clear All Data
                    </Button>
                    <Button colorScheme="red" variant="outline" onClick={handleResetAccount}>
                      Reset Account
                    </Button>
                    <Button colorScheme="red" leftIcon={<FiDatabase />} onClick={onDeleteModalOpen}>
                      Delete Account
                    </Button>
                  </Flex>
                </VStack>
              </CardBody>
            </Card>
          </motion.div>
        </VStack>
      </Box>
      
      {/* Delete Account Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Account Deletion</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={3}>
              Are you sure you want to delete your account? This action is irreversible and will permanently remove all your data including:
            </Text>
            <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
              <li>Your models and training sessions</li>
              <li>Your datasets and configurations</li>
              <li>Your account information and settings</li>
            </ul>
            <Text fontWeight="bold" color="red.500">
              This action cannot be undone. Please type "DELETE" to confirm.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onDeleteModalClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={() => {
                handleDeleteAccount();
                onDeleteModalClose();
              }}
            >
              Delete Account
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}