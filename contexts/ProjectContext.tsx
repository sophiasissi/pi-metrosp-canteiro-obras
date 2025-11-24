import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface ProgressEntry {
  id: string;
  projectId: string;
  progress: number;
  image?: string;
  observations?: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  period: string;
  group: string;
  createdAt: Date;
  image?: string;
  progress: number;
  progressHistory?: ProgressEntry[];
}

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addProgressEntry: (projectId: string, progressData: Omit<ProgressEntry, 'id' | 'projectId' | 'createdAt'>) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects deve ser usado dentro de um ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    setProjects(prev => [newProject, ...prev]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === id ? { ...project, ...updates } : project
      )
    );
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  };

  const addProgressEntry = (projectId: string, progressData: Omit<ProgressEntry, 'id' | 'projectId' | 'createdAt'>) => {
    setProjects(prev =>
      prev.map(project => {
        if (project.id === projectId) {
          const newProgressEntry: ProgressEntry = {
            ...progressData,
            id: Date.now().toString(),
            projectId,
            createdAt: new Date(),
          };

          const updatedHistory = [...(project.progressHistory || []), newProgressEntry];

          // TODO: Integração com CNN do backend
          // O progresso agora virá da análise da CNN que compara a imagem atual com a planta baixa
          // Futuramente: progress = analysisResult.progressPercentage (resultado da CNN)
          return {
            ...project,
            progress: progressData.progress, // Temporário até integração com CNN
            progressHistory: updatedHistory,
          };
        }
        return project;
      })
    );
  };

  return (
    <ProjectContext.Provider value={{ projects, addProject, updateProject, deleteProject, addProgressEntry }}>
      {children}
    </ProjectContext.Provider>
  );
};