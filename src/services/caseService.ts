import api from '@/lib/axios';
import { CaseModel, ApiResponse, PaginatedResponse } from '@/types';

export const caseService = {

  
  async getAll(params?: { search?: string; category_id?: string; status_id?: string; page?: number }) {
    const response = await api.get<ApiResponse<PaginatedResponse<CaseModel>>>('/api/cases', { params });
    return response.data;
  },


  async getCase(id: number) {
    const response = await api.get<ApiResponse<{ case: CaseModel }>>(`/api/cases/${id}`);
    return response.data;
  },

  async create(data: Partial<CaseModel>) {
    const response = await api.post<ApiResponse<CaseModel>>('/api/cases', data);
    return response.data;
  },

  async update(id: number, data: Partial<CaseModel>) {
    const response = await api.put<ApiResponse<CaseModel>>(`/api/cases/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete<ApiResponse<void>>(`/api/cases/${id}`);
    return response.data;
  },
};