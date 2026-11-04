import api from '@/lib/axios';
import { User, ApiResponse, UserFormData } from '@/types';

export const userService = {
  async getAllUsers() {
    const response = await api.get<ApiResponse<User[]>>('/api/users');
    return response.data;
  },

  async createUser(data: UserFormData) {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('password', data.password || '');
    formData.append('role_id', String(data.role_id));
    if (data.phone) formData.append('phone', data.phone);
    if (data.bio_info) formData.append('bio_info', data.bio_info);
    if (data.status !== undefined) formData.append('status', String(data.status));
    if (data.image) formData.append('image', data.image);

    const response = await api.post<ApiResponse<User>>('/api/users', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async updateUser(userId: number, data: UserFormData) {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('role_id', String(data.role_id));
    if (data.password) formData.append('password', data.password);
    if (data.phone) formData.append('phone', data.phone);
    if (data.bio_info) formData.append('bio_info', data.bio_info);
    if (data.status !== undefined) formData.append('status', String(data.status));
    if (data.image) formData.append('image', data.image);
    formData.append('_method', 'PUT');

    const response = await api.post<ApiResponse<User>>(`/api/users/${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deleteUser(userId: number) {
    const response = await api.delete<ApiResponse<void>>(`/api/users/${userId}`);
    return response.data;
  },

  async toggleUserStatus(userId: number, status: 0 | 1) {
    const response = await api.post<ApiResponse<User>>(`/api/users/${userId}/status`, { status });
    return response.data;
  },
};