import React, { createContext, ReactNode, useContext, useState } from 'react';
import { apiService } from '../services/apiService';
import type { RegisterRequest, User } from '../types/api';

interface UsersContextType {
  users: User[];
  isLoading: boolean;
  error: string | null;
  addUser: (userData: RegisterRequest) => Promise<boolean>;
  updateUser: (cpf: string, userData: any) => Promise<boolean>;
  getUserInfo: (cpf: string) => Promise<User | null>;
  getAvailableGroups: () => string[];
  hasUsers: () => boolean;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addUser = async (userData: RegisterRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiService.register(userData);
      if (result.success) {
        // Adicionar usuário à lista local (idealmente deveria recarregar da API)
        const newUser: User = {
          usuarioID: Date.now(), // Temporário - idealmente viria do backend
          nomeCompleto: userData.nomeCompleto,
          cpf: userData.cpf,
          nomeGrupo: userData.nomeGrupo,
          adm: userData.adm || false,
        };
        setUsers(prev => [...prev, newUser]);
        return true;
      } else {
        setError(result.error || 'Erro ao criar usuário');
        return false;
      }
    } catch (err) {
      setError('Erro de conexão');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (cpf: string, userData: any): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiService.updateUserInfo({ ...userData, cpf });
      if (result.success) {
        // Atualizar usuário na lista local
        setUsers(prev => prev.map(user => 
          user.cpf === cpf 
            ? { ...user, ...userData }
            : user
        ));
        return true;
      } else {
        setError(result.error || 'Erro ao atualizar usuário');
        return false;
      }
    } catch (err) {
      setError('Erro de conexão');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInfo = async (cpf: string): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiService.getUserInfo(cpf);
      if (result.success && result.data) {
        return {
          usuarioID: 0, // Backend não retorna ID neste endpoint
          nomeCompleto: result.data.nomeCompleto,
          cpf: result.data.cpf,
          nomeGrupo: result.data.nomeGrupo,
          adm: result.data.adm,
        };
      } else {
        setError(result.error || 'Usuário não encontrado');
        return null;
      }
    } catch (err) {
      setError('Erro de conexão');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableGroups = (): string[] => {
    const userGroups = users.map(user => user.nomeGrupo).filter(Boolean);
    const uniqueGroups = Array.from(new Set(userGroups));
    return uniqueGroups.sort();
  };

  const hasUsers = (): boolean => {
    return users.length > 0;
  };

  return (
    <UsersContext.Provider value={{
      users,
      isLoading,
      error,
      addUser,
      updateUser,
      getUserInfo,
      getAvailableGroups,
      hasUsers,
    }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
};