import { Box, Flex, Text, Button, Spacer, useColorModeValue } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const router = useRouter();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('token'));
  }, []);
  
  return (
    <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Text 
          fontSize="xl" 
          fontWeight="bold" 
          cursor="pointer"
          onClick={() => router.push('/')}
        >
          Epoch-ml
        </Text>
        
        <Spacer />
        
        <Flex alignItems="center">
          {isAuthenticated ? (
            <>
              <Button 
                variant="ghost" 
                mr={4}
                onClick={() => router.push('/dashboard')}
              >
                Dashboard
              </Button>
              <Button 
                variant="ghost" 
                mr={4}
                onClick={() => router.push('/models')}
              >
                Models
              </Button>
              <Button 
                variant="ghost" 
                mr={4}
                onClick={() => router.push('/train')}
              >
                Train
              </Button>
              <Button 
                variant="ghost" 
                mr={4}
                onClick={() => router.push('/training-history')}
              >
                History
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                mr={4}
                onClick={() => router.push('/login')}
              >
                Login
              </Button>
              <Button 
                colorScheme="teal" 
                onClick={() => router.push('/register')}
              >
                Sign Up
              </Button>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
