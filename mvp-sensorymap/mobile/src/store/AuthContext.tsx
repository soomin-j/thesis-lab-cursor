import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService, User } from '../services/AuthService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Auto-login with mock user for demo
        const { user } = await AuthService.login('demo@sensescape.com', 'demo');
        setUser(user);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      // Still try to set mock user for demo
      try {
        const { user } = await AuthService.login('demo@sensescape.com', 'demo');
        setUser(user);
      } catch (e) {
        // Ignore
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { user } = await AuthService.login(email, password);
    setUser(user);
  };

  const register = async (email: string, password: string) => {
    const { user } = await AuthService.register(email, password);
    setUser(user);
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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

