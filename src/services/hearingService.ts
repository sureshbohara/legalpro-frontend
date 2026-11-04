import api from '@/lib/axios';
import { Hearing, ApiResponse, PaginatedResponse } from '@/types';

export const hearingService = {

  async getAll(params?: { search?: string; status?: string; page?: number }) {
    const response = await api.get<ApiResponse<PaginatedResponse<Hearing>>>('/api/hearings', { params });
    return response.data;
  },

 
  async getHearing(id: number) {
    const response = await api.get<ApiResponse<{ hearing: Hearing }>>(`/api/hearings/${id}`);
    return response.data;
  },

  async create(data: Partial<Hearing>) {
    const response = await api.post<ApiResponse<Hearing>>('/api/hearings', data);
    return response.data;
  },

  async update(id: number, data: Partial<Hearing>) {
    const response = await api.put<ApiResponse<Hearing>>(`/api/hearings/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete<ApiResponse<void>>(`/api/hearings/${id}`);
    return response.data;
  },

  async toggleActive(id: number, isActive: boolean) {
    const response = await api.post<ApiResponse<Hearing>>(`/api/hearings/${id}/toggle-active`, { is_active: isActive });
    return response.data;
  },


  async sendReminder(id: number) {
    const response = await api.post<ApiResponse<void>>(`/api/hearings/${id}/send-reminder`);
    return response.data;
  },

  
};