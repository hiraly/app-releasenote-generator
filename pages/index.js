import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  List,
  ListItem,
  Text,
  Textarea,
  useToast,
  VStack,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useProjects } from '../hooks/useProjects';
import { trackEvent, trackPageView } from '../utils/analytics';

export default function Home() {
  const { projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState(null);
  const [iOSReleaseNotes, setIOSReleaseNotes] = useState({});
  const [androidReleaseNotes, setAndroidReleaseNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  useEffect(() => {
    setIsClient(true);
    // ホームページビューをトラッキング
    trackPageView('ホーム');
  }, []);

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    reset({
      translationContent: '',
      baseLanguage: project.baseLanguage,
      iOSLanguages: project.iOSLanguages,
      androidLanguages: project.androidLanguages,
    });

    // プロジェクト選択イベントをトラッキング
    trackEvent('home_project_selected', {
      project_name: project.name,
      project_id: project.id,
    });
  };

  const generateReleaseNotes = async (data) => {
    if (!selectedProject) {
      toast({
        title: 'プロジェクトを選択してください',
        status: 'warning',
        duration: 2000,
      });
      return;
    }

    // リリースノート生成イベントをトラッキング
    trackEvent('generate_release_notes', {
      project_name: selectedProject.name,
      content_length: data.translationContent.length,
    });

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          baseLanguage: selectedProject.baseLanguage,
          iOSLanguages: selectedProject.iOSLanguages,
          androidLanguages: selectedProject.androidLanguages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate release notes');
      }

      const result = await response.json();
      setIOSReleaseNotes(result.iOSReleaseNotes);
      setAndroidReleaseNotes(result.androidReleaseNotes);
    } catch (error) {
      toast({
        title: 'エラーが発生しました',
        description: error.message,
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);

    // コピーイベントをトラッキング
    trackEvent('copy_release_notes', {
      type: type, // 'ios' または 'android'
      content_length: text.length,
    });

    toast({
      title: 'コピーしました',
      status: 'success',
      duration: 2000,
    });
  };

  if (!isClient) {
    return null;
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="container.xl" py={8}>
        <Flex>
          <Box w="250px" mr={8}>
            <Heading as="h2" size="md" mb={4}>
              プロジェクト一覧
            </Heading>
            <List spacing={3}>
              {projects.map((project) => (
                <ListItem key={project.id}>
                  <Button
                    onClick={() => handleProjectSelect(project)}
                    variant={selectedProject && selectedProject.id === project.id ? 'solid' : 'ghost'}
                    size="sm"
                    width="100%"
                  >
                    {project.name}
                  </Button>
                </ListItem>
              ))}
            </List>
            <Box mt={4}>
              <Link href="/projects">
                <Button colorScheme="teal" size="sm" width="100%">
                  プロジェクト管理
                </Button>
              </Link>
            </Box>
          </Box>

          <Box flex={1}>
            <form onSubmit={handleSubmit(generateReleaseNotes)}>
              <VStack spacing={4} align="stretch">
                <FormControl isInvalid={errors.translationContent}>
                  <FormLabel>リリースノートをベース言語で入力してください</FormLabel>
                  <Textarea
                    {...register('translationContent', {
                      required: '翻訳内容は必須です',
                      minLength: {
                        value: 7,
                        message: '7文字以上入力してください',
                      },
                    })}
                    placeholder="いくつかの不具合を修正しました。"
                    minH="200px"
                  />
                  <FormErrorMessage>{errors.translationContent && errors.translationContent.message}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel>ベース言語</FormLabel>
                  <Text>{selectedProject ? selectedProject.baseLanguage : '未選択'}</Text>
                </FormControl>

                <FormControl>
                  <FormLabel>iOS 言語リスト</FormLabel>
                  <Text>{selectedProject ? selectedProject.iOSLanguages : '未選択'}</Text>
                </FormControl>

                <FormControl>
                  <FormLabel>Android 言語リスト</FormLabel>
                  <Text>{selectedProject ? selectedProject.androidLanguages : '未選択'}</Text>
                </FormControl>

                <Button type="submit" colorScheme="blue" isLoading={isLoading} isDisabled={!selectedProject}>
                  リリースノートを生成
                </Button>
              </VStack>
            </form>

            <Flex gap={4} mt={8}>
              <Box flex={1}>
                <Heading as="h2" size="md" mb={2}>
                  iOS リリースノート
                </Heading>
                {Object.entries(iOSReleaseNotes).map(([lang, notes]) => (
                  <Box key={lang} mb={4}>
                    <HStack justify="space-between">
                      <Heading as="h3" size="sm">
                        {lang}
                      </Heading>
                      <Button onClick={() => copyToClipboard(notes, `ios_${lang}`)} size="sm">
                        コピー
                      </Button>
                    </HStack>
                    <Textarea value={notes} readOnly minH="150px" mt={2} />
                  </Box>
                ))}
              </Box>

              <Box flex={1}>
                <Heading as="h2" size="md" mb={2}>
                  Android リリースノート
                </Heading>
                <Textarea value={androidReleaseNotes} readOnly minH="300px" />
                <Button mt={2} onClick={() => copyToClipboard(androidReleaseNotes, 'android')} size="sm">
                  コピー
                </Button>
              </Box>
            </Flex>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
