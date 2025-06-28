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
  login: (email: string, password: string, keepLoggedIn?: boolean) => Promise<void>;
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

      // Validate token with the server
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Token validation failed');
        }

        const userData = await response.json();
        setUser(userData.user);
        setIsLoading(false);
        return true;
      } catch (tokenError) {
        console.error('Token validation failed:', tokenError);
        // Token is invalid, clear it
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('keep_logged_in');
        setUser(null);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('keep_logged_in');
      }
      setUser(null);
      setIsLoading(false);
      return false;
    }
  };

  const login = async (email: string, password: string, keepLoggedIn: boolean = false) => {
    try {
      setIsLoading(true);
      const response = await apiClient.login({ email, password, keepLoggedIn });
      
      // Set user data from login response
      setUser(response.user);
      
      // Store user data in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(response.user));
        // Store the keepLoggedIn preference
        if (keepLoggedIn) {
          localStorage.setItem('keep_logged_in', 'true');
        } else {
          localStorage.removeItem('keep_logged_in');
        }
      }
      
      setIsLoading(false);
      
      // Redirect based on user role
      if (response.user.role === 'MANAGER') {
        router.push('/manager-dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
    
    // Clear user data from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_data');
      localStorage.removeItem('keep_logged_in');
    }
    
    router.push('/login');
  };

  useEffect(() => {
    // Check if we have a token and try to restore user session
    const initializeAuth = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
          try {
            // Validate token with server
            const isValid = await checkAuth();
            
            if (!isValid) {
              // Token is invalid, clear everything
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_data');
              localStorage.removeItem('keep_logged_in');
              setUser(null);
            }
          } catch (error) {
            console.error('Failed to validate token:', error);
            // Clear invalid data
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            localStorage.removeItem('keep_logged_in');
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };

    initializeAuth();

    // Set up periodic token validation (every 5 minutes)
    const interval = setInterval(async () => {
      if (typeof window !== 'undefined' && localStorage.getItem('auth_token')) {
        const isValid = await checkAuth();
        if (!isValid) {
          // Token expired, redirect to login
          router.push('/login');
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [router]);

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