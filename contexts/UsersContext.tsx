import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface User {
  id: number;
  name: string;
  cpf: string;
  group: string;
  isAdmin: boolean;
}

interface UsersContextType {
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (userId: number, userData: Omit<User, 'id'>) => void;
  getAvailableGroups: () => string[];
  hasUsers: () => boolean;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Lista de usuários (em produção viria de uma API/banco de dados)
  const [users, setUsers] = useState<User[]>([]);

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: Math.max(0, ...users.map(u => u.id)) + 1,
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (userId: number, userData: Omit<User, 'id'>) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, ...userData }
        : user
    ));
  };

  const getAvailableGroups = (): string[] => {
    const userGroups = users.map(user => user.group);
    const uniqueGroups = Array.from(new Set(userGroups)).filter(Boolean);
    return uniqueGroups.sort();
  };

  const hasUsers = (): boolean => {
    return users.length > 0;
  };

  return (
    <UsersContext.Provider value={{
      users,
      addUser,
      updateUser,
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