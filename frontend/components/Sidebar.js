import { Box, Flex, Text, VStack, Icon, useColorModeValue } from '@chakra-ui/react';
import { FiHome, FiBarChart2, FiCpu, FiDatabase, FiActivity, FiGrid, FiLayers, FiClock, FiDollarSign, FiSettings, FiUser, FiUpload, FiMessageSquare, FiPlay } from 'react-icons/fi';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Sidebar({ user }) {
  const router = useRouter();
  const bg = useColorModeValue('gray.100', 'gray.700');
  const activeBg = useColorModeValue('teal.500', 'teal.700');
  const activeColor = useColorModeValue('white', 'white');

  const menuItems = [
    { name: 'Dashboard', icon: FiHome, path: '/dashboard' },
    { name: 'AI Playground', icon: FiMessageSquare, path: '/prompt-engineering' },
    { name: 'Model Builder', icon: FiLayers, path: '/model-builder' },
    { name: 'Train Model', icon: FiCpu, path: '/train' },
    { name: 'Test Model', icon: FiPlay, path: '/test-model' },
    { name: 'Models', icon: FiDatabase, path: '/models' },
    { name: 'Model Comparison', icon: FiGrid, path: '/model-comparison' },
    { name: 'Data', icon: FiUpload, path: '/data' },
    { name: 'Training History', icon: FiClock, path: '/training-history' },
    { name: 'Resources', icon: FiDollarSign, path: '/resources' },
    { name: 'Profile', icon: FiUser, path: '/profile' },
    { name: 'Settings', icon: FiSettings, path: '/settings' },
  ];

  return (
    <Box
      w="250px"
      h="100vh"
      pos="fixed"
      left={0}
      top={0}
      bg={bg}
      boxShadow="md"
      zIndex={10}
      borderRight="1px solid"
      borderColor={useColorModeValue('gray.200', 'gray.600')}
    >
      <VStack align="stretch" spacing={1} p={4} mt={16}>
        <Box mb={6} p={4}>
          <Flex align="center">
            <Icon as={FiBarChart2} w={8} h={8} color="teal.500" mr={3} />
            <Text fontSize="xl" fontWeight="bold">Epoch-ml</Text>
          </Flex>
          <Text fontSize="sm" color="gray.500" mt={1}>Machine Learning Platform</Text>
        </Box>

        {menuItems.map((item, index) => {
          // Map menu names to tutorial IDs
          const tutorialIdMap = {
            'Dashboard': 'dashboard-link',
            'Data': 'data-link',
            'Models': 'models-link',
            'Train Model': 'train-link',
            'Test Model': 'test-model-link',
            'Model Builder': 'model-builder-link',
            'Model Comparison': 'model-comparison-link',
            'Training History': 'training-history-link',
            'AI Playground': 'ai-playground-link',
            'Resources': 'resources-link',
            'Profile': 'profile-link',
            'Settings': 'settings-link'
          };
          
          const tutorialId = tutorialIdMap[item.name];
          
          return (
          <Link key={index} href={item.path} passHref>
            <Box
              as="a"
              id={tutorialId}
              p={3}
              borderRadius="md"
              bg={router.pathname === item.path ? activeBg : 'transparent'}
              color={router.pathname === item.path ? activeColor : 'inherit'}
              _hover={{ bg: router.pathname !== item.path ? useColorModeValue('gray.200', 'gray.600') : activeBg }}
              transition="all 0.2s"
            >
              <Flex align="center">
                <Icon as={item.icon} w={5} h={5} mr={3} />
                <Text fontWeight={router.pathname === item.path ? 'bold' : 'normal'}>{item.name}</Text>
              </Flex>
            </Box>
          </Link>
        );})}
      </VStack>

      {user && (
        <Box pos="absolute" bottom={4} left={4} right={4}>
          <Flex align="center" p={3} bg={useColorModeValue('gray.200', 'gray.600')} borderRadius="md">
            <Box w={10} h={10} borderRadius="full" bg="teal.500" mr={3} display="flex" align="center" justify="center">
              <Icon as={FiUser} color="white" />
            </Box>
            <Box>
              <Text fontWeight="bold" fontSize="sm">{user.username}</Text>
              <Text fontSize="xs" color="gray.500">Credits: {user.credits}</Text>
            </Box>
          </Flex>
        </Box>
      )}
    </Box>
  );
}