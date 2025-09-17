import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, RegisterData } from '../types';
import { apiService } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialiser l'authentification au chargement
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const response = await apiService.getProfile();
          setUser(response.user);
        } catch (error) {
          console.error('Failed to load user profile:', error);
          // Token invalide, on le supprime
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await apiService.login({ email, password });
      
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('token', response.token);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      const response = await apiService.register(userData);
      
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('token', response.token);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      const response = await apiService.updateProfile(userData);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const deleteAccount = async (): Promise<void> => {
    try {
      await apiService.deleteAccount();
      logout();
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    updateProfile,
    deleteAccount,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
