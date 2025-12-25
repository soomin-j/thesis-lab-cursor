import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../config/firebase';
import { DemoAuthService } from '../services/DemoAuthService';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isFirebaseConfigured);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      // Use Firebase authentication
      setIsDemoMode(false);
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Use demo authentication mode
      setIsDemoMode(true);
      const unsubscribe = DemoAuthService.onAuthStateChanged((currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, []);

  const login = async (email: string, password: string) => {
    if (isFirebaseConfigured && auth) {
      // Firebase login
      try {
        await signInWithEmailAndPassword(auth, email, password);
        // User state will be updated via onAuthStateChanged
      } catch (error: any) {
        console.error('Login error:', error);
        throw error;
      }
    } else {
      // Demo mode login
      try {
        await DemoAuthService.login(email, password);
        DemoAuthService.triggerAuthChange();
        // User state will be updated via onAuthStateChanged
      } catch (error: any) {
        console.error('Login error:', error);
        throw error;
      }
    }
  };

  const register = async (email: string, password: string) => {
    if (isFirebaseConfigured && auth) {
      // Firebase registration
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        // User state will be updated via onAuthStateChanged
      } catch (error: any) {
        console.error('Registration error:', error);
        throw error;
      }
    } else {
      // Demo mode registration
      try {
        await DemoAuthService.register(email, password);
        DemoAuthService.triggerAuthChange();
        // User state will be updated via onAuthStateChanged
      } catch (error: any) {
        console.error('Registration error:', error);
        throw error;
      }
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      // Firebase logout
      try {
        await signOut(auth);
        // User state will be updated via onAuthStateChanged
      } catch (error: any) {
        console.error('Logout error:', error);
        throw error;
      }
    } else {
      // Demo mode logout
      try {
        await DemoAuthService.logout();
        DemoAuthService.triggerAuthChange();
        // User state will be updated via onAuthStateChanged
      } catch (error: any) {
        console.error('Logout error:', error);
        throw error;
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isDemoMode }}>
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

