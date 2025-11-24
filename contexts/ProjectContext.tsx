import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
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
  removeProgressImage: (projetoID: number, imagemID: number) => Promise<{ success: boolean; error?: string }>;
  refreshProjects: (nomeGrupo?: string) => Promise<any>;
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
        await refreshProjects();
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
        // normalize the returned project
        const normalized = normalizeProject(result.data);
        return normalized;
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
        console.log('addProgressEntry: upload result', result);
        // Se o backend retornou o projeto atualizado, usá-lo diretamente
        const projetoRetornado = result.data?.projeto ?? result.data;
        if (projetoRetornado) {
          const normalized = normalizeProject(projetoRetornado);
          setProjects(prev =>
            prev.map(project =>
              project.projetoID === projetoID ? normalized : project
            )
          );
        } else {
          // fallback: buscar o projeto
          const updatedProject = await getProject(projetoID);
          if (updatedProject) {
            setProjects(prev =>
              prev.map(project =>
                project.projetoID === projetoID ? updatedProject : project
              )
            );
          }
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

  const removeProgressImage = async (projetoID: number, imagemID: number): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiService.removeProgressImage(imagemID);
      if (result.success) {
        // Atualiza o projeto no state buscando o projeto atualizado
        const updated = await getProject(projetoID);
        if (updated) {
          setProjects(prev => prev.map(p => p.projetoID === projetoID ? updated : p));
        }
        return { success: true };
      } else {
        const errMsg = result.error || 'Erro ao deletar imagem';
        setError(errMsg);
        return { success: false, error: errMsg };
      }
    } catch (err) {
      const errMsg = 'Erro de conexão';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProjects = (nomeGrupo?: string) => {
    setIsLoading(true);
    setError(null);
    // Retorna a promise para que chamadores possam await
    return apiService.getProjects(nomeGrupo)
      .then(result => {
        if (result.success && result.data) {
          // normalize projects list
          const normalizedList = (result.data.projetos || []).map((p: any) => normalizeProject(p));
          setProjects(normalizedList);
        } else {
          setError(result.error || 'Erro ao buscar projetos');
        }
        return result;
      })
      .catch((err) => {
        setError('Erro de conexão');
        return { success: false, error: 'Erro de conexão', status: 0 } as any;
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    // Carrega projetos ao montar o provider
    refreshProjects();
  }, []);

  // Normaliza o objeto do projeto vindo do backend para uma forma consistente usada pelo frontend
  function normalizeProject(p: any) {
    if (!p) return p;

    const projetoID = p.projetoID ?? (p.id ? Number(p.id) : undefined);
    const imagensProgresso = (p.imagensProgresso || []).map((img: any) => ({
      imagemID: img.imagemID ?? (img.id ? Number(img.id) : undefined),
      caminhoImagem: img.caminhoImagem ?? img.image,
      porcentagem: img.porcentagem ?? img.progress ?? 0,
      dataEnvio: img.dataEnvio ?? img.createdAt ?? null,
    }));

    const progressHistory = (p.progressHistory || imagensProgresso.map((img: any) => ({
      id: String(img.imagemID),
      image: img.caminhoImagem,
      progress: img.porcentagem,
      createdAt: img.dataEnvio,
    })));

    const max_progress = imagensProgresso.length > 0 ? Math.max(...imagensProgresso.map((i: any) => i.porcentagem || 0)) : 0;

    return {
      projetoID: projetoID,
      nomeProjeto: p.nomeProjeto ?? p.name,
      localizacao: p.localizacao ?? p.location,
      dataInicio: p.dataInicio ?? null,
      dataFim: p.dataFim ?? null,
      imagemInicial: p.imagemInicial ?? p.image,
      imagensProgresso: imagensProgresso,
      // compat
      id: projetoID ? String(projetoID) : undefined,
      name: p.name ?? p.nomeProjeto,
      location: p.location ?? p.localizacao,
      period: p.period ?? `${p.dataInicio ?? ''} - ${p.dataFim ?? ''}`,
      group: p.group ?? (p.grupo ? p.grupo.nomeGrupo : undefined),
      progress: p.progress ?? max_progress,
      image: p.image ?? p.imagemInicial,
      progressHistory: progressHistory,
      createdAt: p.createdAt ?? p.dataInicio,
    } as any;
  }

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
      removeProgressImage,
      refreshProjects 
    }}>
      {children}
    </ProjectContext.Provider>
  );
};