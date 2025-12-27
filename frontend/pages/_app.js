import { ChakraProvider, useToast } from '@chakra-ui/react';
import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { io } from 'socket.io-client';

// Define custom theme
const theme = extendTheme({
  config: {
    initialColorMode: 'system',
    useSystemColorMode: false,
  },
  styles: {
    global: (props) => ({
      body: {
        bg: mode('gray.50', 'gray.900')(props),
        color: mode('gray.800', 'white')(props),
      },
    }),
  },
});

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const toast = useToast();
  const socketRef = useRef();

  // Check authentication for protected routes
  useEffect(() => {
    const token = localStorage.getItem('token');
    const publicPages = ['/', '/login', '/register'];

    if (!token && !publicPages.includes(router.pathname)) {
      router.push('/login');
    }

    // Initialize socket connection if token exists
    if (token && !socketRef.current) {
      socketRef.current = io('http://localhost:5001');

      // Helper to decocde JWT (dirty but works for getting userId)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        socketRef.current.emit('join', payload.userId);
        console.log('Joined notification room for user:', payload.userId);
      } catch (e) {
        console.error('Failed to decode token for socket join', e);
      }

      socketRef.current.on('training_finished', (data) => {
        toast({
          title: 'Training Complete!',
          description: `Your model "${data.modelName}" has finished training.`,
          status: 'success',
          duration: 8000,
          isClosable: true,
          position: 'top-right',
        });
      });

      socketRef.current.on('training_failed', (data) => {
        toast({
          title: 'Training Failed',
          description: `Something went wrong while training "${data.modelName}".`,
          status: 'error',
          duration: 8000,
          isClosable: true,
          position: 'top-right',
        });
      });
    }

    return () => {
      if (socketRef.current) {
        // socketRef.current.disconnect(); 
        // Better to keep it alive during navigation
      }
    };
  }, [router, toast]);

  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;