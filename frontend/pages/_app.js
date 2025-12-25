import { ChakraProvider } from '@chakra-ui/react';
import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

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
  
  // Check authentication for protected routes
  useEffect(() => {
    const token = localStorage.getItem('token');
    const publicPages = ['/', '/login', '/register'];
    
    if (!token && !publicPages.includes(router.pathname)) {
      router.push('/login');
    }
  }, [router]);
  
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;