import {
  Badge,
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
  Progress,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  Stepper,
  StepSeparator,
  StepStatus,
  StepTitle,
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
  const [isLoadingIOS, setIsLoadingIOS] = useState(false);
  const [isLoadingAndroid, setIsLoadingAndroid] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [inputContent, setInputContent] = useState('');
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    reset,
  } = useForm();

  // Ctrl+Enter または Cmd+Enter でフォーム送信
  const handleKeyDown = (e, submitFn) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      submitFn();
    }
  };

  useEffect(() => {
    setIsClient(true);
    // ホームページビューをトラッキング
    trackPageView('ホーム');

    // プロジェクトが存在する場合は最初のプロジェクトを自動選択
    if (projects && projects.length > 0 && !selectedProject) {
      handleProjectSelect(projects[0]);
    }
  }, [projects]);

  const handleProjectSelect = (project) => {
    const currentContent = getValues('translationContent') || inputContent;

    setSelectedProject(project);
    reset({
      translationContent: currentContent,
      baseLanguage: project.baseLanguage,
      iOSLanguages: project.iOSLanguages,
      androidLanguages: project.androidLanguages,
    });

    setInputContent(currentContent);

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

    // 入力内容を保存
    setInputContent(data.translationContent);

    // リリースノート生成イベントをトラッキング
    trackEvent('generate_release_notes', {
      project_name: selectedProject.name,
      content_length: data.translationContent.length,
    });

    setActiveStep(1);

    // iOS リリースノートの生成
    setIsLoadingIOS(true);
    try {
      const iosResponse = await fetch('/api/generate-ios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          translationContent: data.translationContent,
          baseLanguage: selectedProject.baseLanguage,
          iOSLanguages: selectedProject.iOSLanguages,
        }),
      });

      if (!iosResponse.ok) {
        throw new Error('Failed to generate iOS release notes');
      }

      const iosResult = await iosResponse.json();
      setIOSReleaseNotes(iosResult.iOSReleaseNotes);
      setActiveStep(2);
    } catch (error) {
      toast({
        title: 'iOSリリースノート生成エラー',
        description: error.message,
        status: 'error',
      });
    } finally {
      setIsLoadingIOS(false);
    }

    // Android リリースノートの生成
    setIsLoadingAndroid(true);
    try {
      const androidResponse = await fetch('/api/generate-android', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          translationContent: data.translationContent,
          baseLanguage: selectedProject.baseLanguage,
          androidLanguages: selectedProject.androidLanguages,
        }),
      });

      if (!androidResponse.ok) {
        throw new Error('Failed to generate Android release notes');
      }

      const androidResult = await androidResponse.json();
      setAndroidReleaseNotes(androidResult.androidReleaseNotes);
      setActiveStep(3);
    } catch (error) {
      toast({
        title: 'Androidリリースノート生成エラー',
        description: error.message,
        status: 'error',
      });
    } finally {
      setIsLoadingAndroid(false);
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

  const steps = [
    { title: '入力', description: 'リリースノート内容を入力' },
    { title: 'iOS', description: 'iOSリリースノート生成中' },
    { title: 'Android', description: 'Androidリリースノート生成中' },
    { title: '完了', description: 'リリースノート生成完了' },
  ];

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
                      onChange: (e) => setInputContent(e.target.value),
                    })}
                    placeholder="いくつかの不具合を修正しました。"
                    minH="200px"
                    bg="#FFF"
                    onKeyDown={(e) => handleKeyDown(e, handleSubmit(generateReleaseNotes))}
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

                <Stepper index={activeStep} mb={4} mt={4}>
                  {steps.map((step, index) => (
                    <Step key={index}>
                      <StepIndicator>
                        <StepStatus complete={<StepIcon />} incomplete={<StepNumber />} active={<StepNumber />} />
                      </StepIndicator>
                      <Box flexShrink="0">
                        <StepTitle>{step.title}</StepTitle>
                        <StepDescription>{step.description}</StepDescription>
                      </Box>
                      <StepSeparator />
                    </Step>
                  ))}
                </Stepper>

                <Button type="submit" colorScheme="blue" isDisabled={!selectedProject || isLoadingIOS || isLoadingAndroid}>
                  リリースノートを生成
                </Button>
              </VStack>
            </form>

            <Flex gap={4} mt={8}>
              <Box flex={1}>
                <Heading as="h2" size="md" mb={2}>
                  iOS リリースノート
                  {isLoadingIOS && (
                    <Badge ml={2} colorScheme="blue">
                      生成中...
                    </Badge>
                  )}
                </Heading>
                {isLoadingIOS && (
                  <Box mb={4}>
                    <Text mb={2}>iOSリリースノートを生成しています...</Text>
                    <Progress size="xs" isIndeterminate colorScheme="blue" />
                  </Box>
                )}
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
                  {isLoadingAndroid && (
                    <Badge ml={2} colorScheme="green">
                      生成中...
                    </Badge>
                  )}
                </Heading>
                {isLoadingAndroid && (
                  <Box mb={4}>
                    <Text mb={2}>Androidリリースノートを生成しています...</Text>
                    <Progress size="xs" isIndeterminate colorScheme="green" />
                  </Box>
                )}
                <Textarea value={androidReleaseNotes} readOnly minH="300px" bg="#FFF" />
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
