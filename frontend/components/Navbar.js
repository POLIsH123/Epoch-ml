import { Box, Flex, Text, Button, Spacer, useColorMode, useColorModeValue, IconButton } from '@chakra-ui/react';
import { FiSun, FiMoon, FiHome, FiLogIn, FiUserPlus, FiBarChart2, FiLogOut } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  
  const bg = useColorModeValue('white', 'gray.800');
  const color = useColorModeValue('gray.800', 'white');
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch user profile to get updated info
      fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        setUser(data);
      })
      .catch(err => {
        console.error('Error fetching user profile:', err);
        // If token is invalid, remove it
        localStorage.removeItem('token');
        setUser(null);
      });
    }
  }, []);
  
  const handleLogout = async () => {
    // Call logout API endpoint
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    
    // Remove token and update state
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };
  
  return (
    <Box bg={bg} color={color} px={4} py={3} boxShadow="sm">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Flex alignItems="center">
          <FiBarChart2 size={24} color={useColorModeValue('teal.500', 'teal.300')} />
          <Text ml={2} fontSize="xl" fontWeight="bold">Epoch-ml</Text>
        </Flex>
        
        <Spacer />
        
        <Flex alignItems="center" gap={4}>
          <Button
            variant="ghost"
            leftIcon={<FiHome />}
            onClick={() => router.push('/')}
          >
            Home
          </Button>
          
          {!user ? (
            <>
              <Button
                variant="ghost"
                leftIcon={<FiLogIn />}
                onClick={() => router.push('/login')}
              >
                Login
              </Button>
              <Button
                colorScheme="teal"
                leftIcon={<FiUserPlus />}
                onClick={() => router.push('/register')}
              >
                Sign Up
              </Button>
            </>
          ) : (
            <>
              <Text mr={4}>Credits: {user.credits}</Text>
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
              >
                {user.username}
              </Button>
              <Button
                variant="ghost"
                leftIcon={<FiLogOut />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          )}
          
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            onClick={toggleColorMode}
            variant="ghost"
          />
        </Flex>
      </Flex>
    </Box>
  );
}