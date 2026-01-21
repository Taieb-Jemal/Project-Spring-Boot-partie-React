import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { authApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    // Demo mode - bypass API for presentation
    const demoUsers: Record<string, { user: User; password: string }> = {
      'mohamed': { user: { id: 1, username: 'mohamed', email: 'mohamed@demo.com', role: 'ADMIN', firstName: 'Mohamed', lastName: 'Admin' }, password: 'admin123' },
      'saleh': { user: { id: 2, username: 'saleh', email: 'saleh@demo.com', role: 'ETUDIANT', firstName: 'Saleh', lastName: 'Student' }, password: 'student123' },
      'ali': { user: { id: 3, username: 'ali', email: 'ali@demo.com', role: 'FORMATEUR', firstName: 'Ali', lastName: 'Trainer' }, password: 'trainer123' },
    };

    if (demoUsers[username] && demoUsers[username].password === password) {
      const user = demoUsers[username].user;
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      return;
    }

    // Fallback to API if demo credentials don't match
    try {
      const response = await authApi.login(username, password);
      if (response.status === 'success' && response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    authApi.logout().catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
