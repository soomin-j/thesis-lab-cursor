/**
 * Demo Authentication Service
 * Works without Firebase - uses localStorage for persistence
 * This allows testing the app when Firebase is not available
 */

interface User {
  id: string;
  email: string;
}

const STORAGE_KEY = 'demo_auth_user';
const STORAGE_TOKEN_KEY = 'demo_auth_token';

export class DemoAuthService {
  /**
   * Register a new user (demo mode - stores in localStorage)
   */
  static async register(email: string, password: string): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user already exists
    const existingUsers = this.getAllUsers();
    if (existingUsers.find(u => u.email === email)) {
      throw new Error('Email already registered');
    }

    // Create new user
    const user: User = {
      id: `demo-user-${Date.now()}`,
      email: email.toLowerCase().trim(),
    };

    // Store user and password hash (simple demo - not secure!)
    const userData = {
      ...user,
      passwordHash: btoa(password), // Simple encoding (NOT secure - demo only!)
    };

    existingUsers.push(userData);
    localStorage.setItem('demo_users', JSON.stringify(existingUsers));
    
    // Set as current user
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(STORAGE_TOKEN_KEY, `demo-token-${user.id}`);

    return user;
  }

  /**
   * Login with email and password (demo mode)
   */
  static async login(email: string, password: string): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const allUsers = this.getAllUsers();
    const userData = allUsers.find(
      u => u.email.toLowerCase().trim() === email.toLowerCase().trim()
    );

    if (!userData) {
      throw new Error('User not found');
    }

    // Simple password check (demo only - NOT secure!)
    const storedPasswordHash = userData.passwordHash;
    const inputPasswordHash = btoa(password);
    
    if (storedPasswordHash !== inputPasswordHash) {
      throw new Error('Invalid password');
    }

    const user: User = {
      id: userData.id,
      email: userData.email,
    };

    // Set as current user
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(STORAGE_TOKEN_KEY, `demo-token-${user.id}`);

    return user;
  }

  /**
   * Logout current user
   */
  static async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
  }

  /**
   * Get current user from localStorage
   */
  static getCurrentUser(): User | null {
    const userStr = localStorage.getItem(STORAGE_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * Get all registered users (for demo purposes)
   */
  private static getAllUsers(): any[] {
    const usersStr = localStorage.getItem('demo_users');
    if (usersStr) {
      try {
        return JSON.parse(usersStr);
      } catch {
        return [];
      }
    }
    return [];
  }

  /**
   * Listen to auth state changes (simulates Firebase onAuthStateChanged)
   */
  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    // Call immediately with current user
    callback(this.getCurrentUser());

    // Listen to storage changes (for multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        callback(this.getCurrentUser());
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen to custom events (for same-tab changes)
    const handleCustomEvent = () => {
      callback(this.getCurrentUser());
    };

    window.addEventListener('demo-auth-changed', handleCustomEvent);

    // Return unsubscribe function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('demo-auth-changed', handleCustomEvent);
    };
  }

  /**
   * Trigger auth state change event
   */
  static triggerAuthChange(): void {
    window.dispatchEvent(new Event('demo-auth-changed'));
  }
}

