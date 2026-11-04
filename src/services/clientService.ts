import api from '@/lib/axios';
import { Client, ApiResponse, PaginatedResponse } from '@/types'; 

export const clientService = {
  async getAllClients(params?: { search?: string; type?: string; status?: string; page?: number }) {
    const response = await api.get<ApiResponse<PaginatedResponse<Client>>>('/api/clients', { params });
    return response.data;
  },

  async createClient(data: Partial<Client>) {
    const response = await api.post<ApiResponse<Client>>('/api/clients', data);
    return response.data;
  },

  async updateClient(id: number, data: Partial<Client>) {
    const response = await api.put<ApiResponse<Client>>(`/api/clients/${id}`, data);
    return response.data;
  },

  async deleteClient(id: number) {
    const response = await api.delete<ApiResponse<void>>(`/api/clients/${id}`);
    return response.data;
  },

  async toggleClientStatus(id: number, status: 0 | 1) {
    const response = await api.post<ApiResponse<Client>>(`/api/clients/${id}/status`, { status });
    return response.data;
  },

  
  async sendPortalInvite(id: number) {
    const response = await api.post<ApiResponse<void>>(`/api/clients/${id}/send-portal-invite`);
    return response.data;
  },
};