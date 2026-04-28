import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await SecureStore.getItemAsync('user');
      if (userData) {
        setState({
          user: JSON.parse(userData),
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setState({ ...state, isLoading: false });
      }
    } catch (error) {
      setState({ ...state, isLoading: false });
    }
  };

  const login = async (email: string, password: string) => {
    // Mock login - replace with actual API call
    const mockUser: User = {
      id: '1',
      username: 'demo_user',
      email: email,
      accuracy: 75,
      totalPredictions: 20,
      correctPredictions: 15,
      createdAt: new Date().toISOString(),
    };
    
    await SecureStore.setItemAsync('user', JSON.stringify(mockUser));
    setState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const register = async (username: string, email: string, password: string) => {
    // Mock register - replace with actual API call
    const mockUser: User = {
      id: '1',
      username: username,
      email: email,
      accuracy: 0,
      totalPredictions: 0,
      correctPredictions: 0,
      createdAt: new Date().toISOString(),
    };
    
    await SecureStore.setItemAsync('user', JSON.stringify(mockUser));
    setState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('user');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
