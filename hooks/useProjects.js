import { useEffect, useState } from 'react';

export function useProjects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const storedProjects = JSON.parse(localStorage.getItem('projects')) || [];
    setProjects(storedProjects);
  }, []);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  const saveProject = (project) => {
    const existingProjectIndex = projects.findIndex((p) => p.id === project.id);
    if (existingProjectIndex !== -1) {
      const updatedProjects = [...projects];
      updatedProjects[existingProjectIndex] = project;
      setProjects(updatedProjects);
    } else {
      setProjects([...projects, { ...project, id: Date.now() }]);
    }
  };

  const deleteProject = (projectId) => {
    setProjects(projects.filter((p) => p.id !== projectId));
  };

  return { projects, saveProject, deleteProject };
}
