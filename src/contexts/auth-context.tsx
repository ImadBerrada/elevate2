'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user && (typeof window !== 'undefined' && !!localStorage.getItem('auth_token'));

  const checkAuth = async (): Promise<boolean> => {
    try {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return false;
      }
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoading(false);
        return false;
      }

      // For now, we'll assume the token is valid if it exists
      // In a real app, you'd validate the token with the server
      // You could add a /api/auth/me endpoint to validate the token
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      setUser(null);
      setIsLoading(false);
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.login({ email, password });
      
      // Set user data from login response
      setUser(response.user);
      setIsLoading(false);
      
      // Redirect to dashboard after successful login
      router.push('/dashboard');
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
    router.push('/login');
  };

  useEffect(() => {
    // Check if we have a token and try to restore user session
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // For now, we'll just mark as authenticated
        // In a real app, you'd fetch user data from the server
        setUser({
          id: 'temp-id',
          email: 'user@example.com',
          firstName: 'User',
          lastName: 'Name',
          role: 'USER'
        });
      }
    }
    setIsLoading(false);
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 