import { Box, Button, Container, Flex, FormControl, FormLabel, Heading, Input, List, ListItem, Textarea, VStack, useToast } from '@chakra-ui/react';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { trackEvent, trackPageView } from '../utils/analytics';

export default function Projects() {
  const { projects, saveProject, deleteProject } = useProjects();
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    baseLanguage: '',
    iOSLanguages: '',
    androidLanguages: '',
  });
  const toast = useToast();

  // ページ読み込み時にページビューイベントを記録
  useEffect(() => {
    trackPageView('プロジェクト管理');
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: 'プロジェクト名を入力してください',
        status: 'warning',
        duration: 2000,
      });
      return;
    }

    const isNewProject = !selectedProject;
    const projectData = {
      id: selectedProject ? selectedProject.id : Date.now(),
      ...formData,
    };

    saveProject(projectData);

    // プロジェクト作成または更新イベントを記録
    trackEvent(isNewProject ? 'project_created' : 'project_updated', {
      project_name: projectData.name,
      has_base_language: !!projectData.baseLanguage,
      has_ios_languages: !!projectData.iOSLanguages,
      has_android_languages: !!projectData.androidLanguages,
    });

    toast({
      title: isNewProject ? 'プロジェクトを保存しました' : 'プロジェクトを更新しました',
      status: 'success',
      duration: 2000,
    });

    setSelectedProject(null);
    setFormData({
      name: '',
      baseLanguage: '',
      iOSLanguages: '',
      androidLanguages: '',
    });
  };

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      baseLanguage: project.baseLanguage,
      iOSLanguages: project.iOSLanguages,
      androidLanguages: project.androidLanguages,
    });

    // プロジェクト選択イベントを記録
    trackEvent('project_selected', {
      project_name: project.name,
      project_id: project.id,
    });
  };

  const handleDeleteProject = (projectId) => {
    // 削除前にプロジェクト情報を保存しておく
    const projectToDelete = projects.find((project) => project.id === projectId);

    deleteProject(projectId);

    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject(null);
      setFormData({
        name: '',
        baseLanguage: '',
        iOSLanguages: '',
        androidLanguages: '',
      });
    }

    // プロジェクト削除イベントを記録
    if (projectToDelete) {
      trackEvent('project_deleted', {
        project_name: projectToDelete.name,
        project_id: projectId,
      });
    }

    toast({
      title: 'プロジェクトを削除しました',
      status: 'info',
      duration: 2000,
    });
  };

  const handleNewProject = () => {
    setSelectedProject(null);
    setFormData({
      name: '',
      baseLanguage: '',
      iOSLanguages: '',
      androidLanguages: '',
    });

    // 新規プロジェクト作成フォーム表示イベントを記録
    trackEvent('new_project_form_opened');
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Head>
        <title>プロジェクト管理 - Appリリースノート生成ツール</title>
      </Head>

      <Container maxW="container.xl" py={8}>
        <Flex>
          <Box w="250px" mr={8}>
            <Heading as="h2" size="md" mb={4}>
              プロジェクト一覧
            </Heading>
            <Button onClick={handleNewProject} colorScheme="green" size="sm" width="100%" mb={4}>
              新規登録
            </Button>
            <List spacing={3}>
              {projects.map((project) => (
                <ListItem key={project.id}>
                  <Flex justify="space-between" align="center">
                    <Button
                      onClick={() => handleSelectProject(project)}
                      variant={selectedProject && selectedProject.id === project.id ? 'solid' : 'ghost'}
                      size="sm"
                    >
                      {project.name}
                    </Button>
                    <Button onClick={() => handleDeleteProject(project.id)} colorScheme="red" size="sm">
                      削除
                    </Button>
                  </Flex>
                </ListItem>
              ))}
            </List>
          </Box>

          <Box flex={1}>
            <Heading as="h1" size="xl" mb={6}>
              プロジェクト{selectedProject ? '編集' : '登録'}
            </Heading>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>プロジェクト名</FormLabel>
                  <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="プロジェクト名" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>ベース言語 (例: ja)</FormLabel>
                  <Input name="baseLanguage" value={formData.baseLanguage} onChange={handleInputChange} placeholder="ja" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>iOS 言語リスト</FormLabel>
                  <Textarea name="iOSLanguages" value={formData.iOSLanguages} onChange={handleInputChange} placeholder="例： ja,en,fr,de" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Android 言語リスト</FormLabel>
                  <Textarea
                    name="androidLanguages"
                    value={formData.androidLanguages}
                    onChange={handleInputChange}
                    placeholder="例： &lt;en-US&gt;&lt;/en-US&gt;,&lt;ja-JP&gt;&lt;/ja-JP&gt;"
                  />
                </FormControl>
                <Button type="submit" colorScheme="blue" onClick={() => trackEvent('form_submit_clicked')}>
                  {selectedProject ? '更新' : '保存'}
                </Button>
              </VStack>
            </form>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
