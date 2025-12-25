import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export class AuthService {
  static async register(email: string, password: string): Promise<AuthResponse> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const token = await userCredential.user.getIdToken();
      
      return {
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email || '',
        },
        token,
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const token = await userCredential.user.getIdToken();
      
      return {
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email || '',
        },
        token,
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      await auth().signOut();
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth().currentUser;
    if (firebaseUser) {
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
      };
    }
    return null;
  }

  static async isAuthenticated(): Promise<boolean> {
    return auth().currentUser !== null;
  }

  // Listen to auth state changes
  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return auth().onAuthStateChanged((firebaseUser: FirebaseAuthTypes.User | null) => {
      if (firebaseUser) {
        callback({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
        });
      } else {
        callback(null);
      }
    });
  }
}

