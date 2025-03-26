import { Box, ChakraProvider } from '@chakra-ui/react';
import Navigation from '../components/Navigation';
import usePostHog from '../hooks/usePostHog';
import theme from '../styles/theme';

function MyApp({ Component, pageProps }) {
  // PostHogを初期化
  usePostHog();

  return (
    <ChakraProvider theme={theme}>
      <Navigation />
      <Box pt="60px">
        <Component {...pageProps} />
      </Box>
    </ChakraProvider>
  );
}

export default MyApp;
