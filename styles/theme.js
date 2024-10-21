import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'light', // デフォルトのカラーモードをライトに設定
    useSystemColorMode: false,
  },
  components: {
    Input: {
      baseStyle: (props) => ({
        field: {
          bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
          color: props.colorMode === 'dark' ? 'white' : 'black',
          _placeholder: {
            color: props.colorMode === 'dark' ? 'gray.400' : 'gray.500',
          },
        },
      }),
    },
    Textarea: {
      baseStyle: (props) => ({
        bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
        color: props.colorMode === 'dark' ? 'white' : 'black',
        _placeholder: {
          color: props.colorMode === 'dark' ? 'gray.400' : 'gray.500',
        },
      }),
    },
  },
});

export default theme;
