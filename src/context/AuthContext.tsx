import React, { createContext, useContext, useState, useEffect } from 'react';
import { Admin, Reseller, AuthState } from '../types';
import adminData from '../data/admin.json';
import resellersData from '../data/resellers.json';
import tokensData from '../data/tokens.json';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  authState: AuthState;
  loginAdmin: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginReseller: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  registerReseller: (username: string, password: string, referralToken: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  userType: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const navigate = useNavigate();

  useEffect(() => {
    const storedAuthState = localStorage.getItem('authState');
    if (storedAuthState) {
      setAuthState(JSON.parse(storedAuthState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('authState', JSON.stringify(authState));
  }, [authState]);

  const loginAdmin = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    if (username === adminData.username && password === adminData.password) {
      setAuthState({
        isAuthenticated: true,
        user: { username, password },
        userType: 'admin',
      });
      return { success: true, message: 'Login successful!' };
    }
    
    return { success: false, message: 'Invalid credentials' };
  };

  const loginReseller = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const reseller = resellersData.find(r => r.username === username && r.password === password);

    if (reseller) {
      setAuthState({
        isAuthenticated: true,
        user: reseller,
        userType: 'reseller',
      });
      return { success: true, message: 'Login successful!' };
    }
    
    return { success: false, message: 'Invalid credentials' };
  };

  const registerReseller = async (
    username: string, 
    password: string,
    referralToken: string
  ): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const newReseller: Reseller = {
      id: crypto.randomUUID(),
      username,
      password,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newReseller,
          referralToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Registration failed' };
      }

      return { success: true, message: 'Registration successful! You can now login.' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Failed to register. Please try again.' };
    }
  };

  const logout = () => {
    setAuthState(initialAuthState);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ authState, loginAdmin, loginReseller, registerReseller, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};