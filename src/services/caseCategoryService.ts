import api from '@/lib/axios';
import { CaseCategory, ApiResponse, PaginatedResponse } from '@/types';

export const caseCategoryService = {


  async getAll(params?: { search?: string; status?: string; page?: number }) {
    const response = await api.get<ApiResponse<PaginatedResponse<CaseCategory>>>('/api/case-categories', { params });
    return response.data;
  },

  async create(data: Partial<CaseCategory>) {
    const response = await api.post<ApiResponse<CaseCategory>>('/api/case-categories', data);
    return response.data;
  },

  async update(id: number, data: Partial<CaseCategory>) {
    const response = await api.put<ApiResponse<CaseCategory>>(`/api/case-categories/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete<ApiResponse<void>>(`/api/case-categories/${id}`);
    return response.data;
  },

  async toggleStatus(id: number, status: 0 | 1) {
    const response = await api.post<ApiResponse<CaseCategory>>(`/api/case-categories/${id}/status`, { status });
    return response.data;
  },
  
};