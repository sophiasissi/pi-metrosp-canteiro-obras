import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface LoggedUser {
  id: number;
  name: string;
  cpf: string;
  group?: string;
  isAdmin: boolean;
}

interface AuthContextType {
  loggedUser: LoggedUser | null;
  setLoggedUser: (user: LoggedUser | null) => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loggedUser, setLoggedUser] = useState<LoggedUser | null>(null);

  const isLoggedIn = loggedUser !== null;
  const isAdmin = loggedUser?.isAdmin || false;

  const logout = () => {
    setLoggedUser(null);
  };

  return (
    <AuthContext.Provider value={{
      loggedUser,
      setLoggedUser,
      isLoggedIn,
      isAdmin,
      logout,
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