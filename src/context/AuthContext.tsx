'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType, UserRole } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users with different roles
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  admin: {
    password: 'admin123',
    user: {
      id: '1',
      username: 'admin',
      email: 'admin@construction.com',
      role: 'admin',
      avatar: '👨‍💼'
    }
  },
  manager: {
    password: 'manager123',
    user: {
      id: '2',
      username: 'manager',
      email: 'manager@construction.com',
      role: 'manager',
      avatar: '👨‍💼'
    }
  },
  viewer: {
    password: 'viewer123',
    user: {
      id: '3',
      username: 'viewer',
      email: 'viewer@construction.com',
      role: 'viewer',
      avatar: '👁️'
    }
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Failed to load user from localStorage', e);
      }
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const userKey = username.toLowerCase();
    const demoUser = DEMO_USERS[userKey];

    if (demoUser && demoUser.password === password) {
      setUser(demoUser.user);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(demoUser.user));
      return true;
    }
    return false;
  };

  const logout = (): void => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  const switchRole = (role: UserRole): void => {
    if (user && (role === 'admin' || role === 'manager' || role === 'viewer')) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
    switchRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
