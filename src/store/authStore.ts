import { create } from 'zustand';
import { User } from '@/types';
import { authService } from '@/services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ email, password });
      
      if (response.success && response.user) {
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
        }
        set({ user: response.user, isAuthenticated: true, isLoading: false });
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Invalid email or password';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      set({ user: null, isAuthenticated: false });
      window.location.href = '/login';
    }
  },

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.user) {
        set({ user: response.user, isAuthenticated: true, isLoading: false });
      }
    } catch (error) {
      localStorage.removeItem('auth_token'); 
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));