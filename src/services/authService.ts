import api from '@/lib/axios';
import { User, LoginCredentials, ApiResponse } from '@/types';

export const authService = {

  async login(credentials: LoginCredentials) {
    const response = await api.post<any>('/api/login', credentials);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get<ApiResponse<User>>('/api/user');
    return response.data;
  },

  async logout() {
    const response = await api.post<ApiResponse<void>>('/api/logout');
    return response.data;
  },
};