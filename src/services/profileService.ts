import api from '@/lib/axios';
import { User, ApiResponse, ProfileUpdateData, ChangePasswordData } from '@/types';

export const profileService = {
  async updateProfile(data: ProfileUpdateData) {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    if (data.phone) formData.append('phone', data.phone);
    if (data.bio_info) formData.append('bio_info', data.bio_info);
    if (data.image) formData.append('image', data.image);
    formData.append('_method', 'PUT');

    const response = await api.post<ApiResponse<User>>('/api/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async changePassword(data: ChangePasswordData) {
    const response = await api.put<ApiResponse<void>>('/api/profile/password', data);
    return response.data;
  },
};