import api from '@/lib/axios';
import { CaseStatus, ApiResponse, PaginatedResponse } from '@/types';

export const caseStatusService = {

  
  async getAll(params?: { search?: string; status?: string; page?: number }) {
    const response = await api.get<ApiResponse<PaginatedResponse<CaseStatus>>>('/api/case-statuses', { params });
    return response.data;
  },

  async create(data: Partial<CaseStatus>) {
    const response = await api.post<ApiResponse<CaseStatus>>('/api/case-statuses', data);
    return response.data;
  },

  async update(id: number, data: Partial<CaseStatus>) {
    const response = await api.put<ApiResponse<CaseStatus>>(`/api/case-statuses/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete<ApiResponse<void>>(`/api/case-statuses/${id}`);
    return response.data;
  },

  async toggleStatus(id: number, status: 0 | 1) {
    const response = await api.post<ApiResponse<CaseStatus>>(`/api/case-statuses/${id}/status`, { status });
    return response.data;
  },

};