import { Box, ChakraProvider } from '@chakra-ui/react';
import Head from 'next/head';
import Navigation from '../components/Navigation';
import usePostHog from '../hooks/usePostHog';
import theme from '../styles/theme';

function MyApp({ Component, pageProps }) {
  // PostHogを初期化
  usePostHog();

  return (
    <ChakraProvider theme={theme}>
      <Head>
        <title>App Release Note Generator</title>
        <meta name="description" content="アプリのリリースノートを複数言語で簡単に生成" />
        <meta property="og:title" content="App Release Note Generator" />
        <meta property="og:description" content="アプリのリリースノートを複数言語で簡単に生成" />
        <meta property="og:image" content="https://releasenote-generator.netlify.app/assets/ogp.png" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="App Release Note Generator" />
        <meta name="twitter:description" content="アプリのリリースノートを複数言語で簡単に生成" />
        <meta name="twitter:image" content="https://releasenote-generator.netlify.app/assets/ogp.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navigation />
      <Box pt="60px">
        <Component {...pageProps} />
      </Box>
    </ChakraProvider>
  );
}

export default MyApp;
