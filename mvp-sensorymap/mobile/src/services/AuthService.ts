import AsyncStorage from '@react-native-async-storage/async-storage';
import { MockDataService, MOCK_USER } from './MockDataService';

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Use mock data instead of API
const USE_MOCK_DATA = true;

export class AuthService {
  static async register(email: string, password: string): Promise<AuthResponse> {
    if (USE_MOCK_DATA) {
      const response = await MockDataService.register(email, password);
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('refreshToken', response.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      return response;
    }

    // Original API code (commented out for mock mode)
    // const response = await api.post('/auth/register', { email, password });
    // const { user, token, refreshToken } = response.data;
    // await AsyncStorage.setItem('authToken', token);
    // await AsyncStorage.setItem('refreshToken', refreshToken);
    // await AsyncStorage.setItem('user', JSON.stringify(user));
    // return { user, token, refreshToken };
    
    throw new Error('API mode not available');
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    if (USE_MOCK_DATA) {
      const response = await MockDataService.login(email, password);
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('refreshToken', response.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      return response;
    }

    // Original API code (commented out for mock mode)
    // const response = await api.post('/auth/login', { email, password });
    // const { user, token, refreshToken } = response.data;
    // await AsyncStorage.setItem('authToken', token);
    // await AsyncStorage.setItem('refreshToken', refreshToken);
    // await AsyncStorage.setItem('user', JSON.stringify(user));
    // return { user, token, refreshToken };
    
    throw new Error('API mode not available');
  }

  static async logout(): Promise<void> {
    await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'user']);
  }

  static async getCurrentUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    // Return mock user if no stored user (for demo purposes)
    if (USE_MOCK_DATA) {
      return MOCK_USER;
    }
    return null;
  }

  static async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('authToken');
    if (USE_MOCK_DATA && !token) {
      // Auto-login with mock user for demo
      return true;
    }
    return !!token;
  }
}

