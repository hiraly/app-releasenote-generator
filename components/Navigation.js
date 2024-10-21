import { Box, Button, Flex } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navigation() {
  const router = useRouter();

  return (
    <Box position="fixed" top={0} left={0} right={0} zIndex={10} bg="white" boxShadow="md">
      <Flex justify="flex-start" p={4} maxW="container.xl" mx="auto">
        <Link href="/" passHref>
          <Button as="a" colorScheme={router.pathname === '/' ? 'blue' : 'gray'} mr={4}>
            ホーム
          </Button>
        </Link>
        <Link href="/projects" passHref>
          <Button as="a" colorScheme={router.pathname === '/projects' ? 'blue' : 'gray'}>
            プロジェクト管理
          </Button>
        </Link>
      </Flex>
    </Box>
  );
}
