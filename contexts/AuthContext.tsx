import React, { createContext, ReactNode, useContext, useState } from 'react';
import { apiService, LoginRequest } from '../services/apiService';

export interface LoggedUser {
  usuarioID: number;
  nomeCompleto: string;
  cpf: string;
  grupoID?: number;
  adm: boolean;
}

interface AuthContextType {
  loggedUser: LoggedUser | null;
  setLoggedUser: (user: LoggedUser | null) => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  logout: () => void;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
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
        
        setLoggedUser(user);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.error || 'Erro desconhecido' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Erro de conexão com o servidor' 
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