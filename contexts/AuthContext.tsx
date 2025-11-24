import React, { createContext, ReactNode, useContext, useState } from 'react';
import { apiService } from '../services/apiService';
import type { LoggedUser, LoginRequest } from '../types/api';

interface AuthContextType {
  loggedUser: LoggedUser | null;
  setLoggedUser: (user: LoggedUser | null) => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  logout: () => void;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  updateLoggedUser: (userData: Partial<LoggedUser>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loggedUser, setLoggedUser] = useState<LoggedUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isLoggedIn = loggedUser !== null;
  const isAdmin = loggedUser?.adm || false;

  const logout = () => {
    setLoggedUser(null);
  };

  const updateLoggedUser = (userData: Partial<LoggedUser>) => {
    if (loggedUser) {
      setLoggedUser({ ...loggedUser, ...userData });
    }
  };

  const login = async (credentials: LoginRequest): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const result = await apiService.login(credentials);
      
      if (result.success && result.data) {
        const user: LoggedUser = {
          usuarioID: result.data.usuario.usuarioID,
          nomeCompleto: result.data.usuario.nomeCompleto,
          cpf: result.data.usuario.cpf,
          grupoID: result.data.usuario.grupoID,
          adm: result.data.usuario.adm,
        };

        // Buscar informações completas do usuário incluindo nome do grupo
        try {
          const userInfoResult = await apiService.getUserInfo(user.cpf);
          if (userInfoResult.success && userInfoResult.data) {
            user.nomeGrupo = userInfoResult.data.nomeGrupo;
          }
        } catch (error) {
          console.warn('Não foi possível buscar nome do grupo:', error);
        }
        
        setLoggedUser(user);
        return { success: true };
      } else {
        // Passa a mensagem de erro específica do apiService
        return { 
          success: false, 
          error: result.error || 'Falha na autenticação. Verifique suas credenciais.' 
        };
      }
    } catch (error) {
      console.error('Erro no AuthContext login:', error);
      // Retorna uma mensagem mais específica para erro de conexão
      return { 
        success: false, 
        error: 'Erro de conexão com o servidor. Verifique sua internet e tente novamente.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      loggedUser,
      setLoggedUser,
      isLoggedIn,
      isAdmin,
      logout,
      login,
      updateLoggedUser,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};