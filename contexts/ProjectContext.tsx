import React, { createContext, ReactNode, useContext, useState } from 'react';
import { apiService } from '../services/apiService';
import type { ProgressImage, Project } from '../types/api';

// Alias para compatibilidade
export type ProgressEntry = ProgressImage;

interface ProjectContextType {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  addProject: (formData: FormData) => Promise<boolean>;
  updateProject: (projetoID: number, updates: { dataFim: string }) => Promise<boolean>;
  deleteProject: (projetoID: number) => Promise<boolean>;
  getProject: (projetoID: number) => Promise<Project | null>;
  addProgressEntry: (projetoID: number, formData: FormData) => Promise<{ success: boolean; porcentagem?: number; error?: string }>;
  refreshProjects: () => void;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addProject = async (formData: FormData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiService.addProject(formData);
      if (result.success) {
        refreshProjects();
        return true;
      } else {
        setError(result.error || 'Erro ao adicionar projeto');
        return false;
      }
    } catch (err) {
      setError('Erro de conexão');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProject = async (projetoID: number, updates: { dataFim: string }): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiService.updateProject(projetoID, updates);
      if (result.success) {
        setProjects(prev =>
          prev.map(project =>
            project.projetoID === projetoID ? { ...project, ...updates } : project
          )
        );
        return true;
      } else {
        setError(result.error || 'Erro ao atualizar projeto');
        return false;
      }
    } catch (err) {
      setError('Erro de conexão');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (projetoID: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiService.removeProject(projetoID);
      if (result.success) {
        setProjects(prev => prev.filter(project => project.projetoID !== projetoID));
        return true;
      } else {
        setError(result.error || 'Erro ao deletar projeto');
        return false;
      }
    } catch (err) {
      setError('Erro de conexão');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getProject = async (projetoID: number): Promise<Project | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiService.getProject(projetoID);
      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.error || 'Projeto não encontrado');
        return null;
      }
    } catch (err) {
      setError('Erro de conexão');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const addProgressEntry = async (projetoID: number, formData: FormData): Promise<{ success: boolean; porcentagem?: number; error?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiService.uploadProgressImage(projetoID, formData);
      if (result.success) {
        // Atualizar o projeto local com a nova imagem de progresso
        const updatedProject = await getProject(projetoID);
        if (updatedProject) {
          setProjects(prev =>
            prev.map(project =>
              project.projetoID === projetoID ? updatedProject : project
            )
          );
        }
        return { 
          success: true, 
          porcentagem: result.data?.porcentagem 
        };
      } else {
        const errorMsg = result.error || 'Erro ao adicionar progresso';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = 'Erro de conexão';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProjects = () => {
    // Implementar quando houver endpoint para listar projetos
    // Por enquanto, mantém a lista existente
    console.log('refreshProjects: Funcionalidade a ser implementada');
  };

  return (
    <ProjectContext.Provider value={{ 
      projects, 
      isLoading, 
      error, 
      addProject, 
      updateProject, 
      deleteProject, 
      getProject,
      addProgressEntry,
      refreshProjects 
    }}>
      {children}
    </ProjectContext.Provider>
  );
};