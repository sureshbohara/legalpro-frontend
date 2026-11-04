import api from '@/lib/axios';
import { ApiResponse, Setting } from '@/types';

export const settingService = {
  
  async getSettings() {
    const response = await api.get<ApiResponse<Setting>>('/api/settings');
    return response.data;
  },


  async updateSettings(formData: FormData) {
    const response = await api.post<ApiResponse<Setting>>('/api/settings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

};