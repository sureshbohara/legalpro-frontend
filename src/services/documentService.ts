import api from '@/lib/axios';
import { Document, ApiResponse, PaginatedResponse, SummarizeResponse } from '@/types'; 

export const documentService = {
  async getAll(params?: { 
    search?: string; 
    category?: string; 
    case_id?: string; 
    client_id?: string;
    page?: number 
  }) {
    const response = await api.get<ApiResponse<PaginatedResponse<Document>>>('/api/documents', { params });
    return response.data;
  },

  async getDocument(id: number) {
    const response = await api.get<ApiResponse<{ document: Document }>>(`/api/documents/${id}`);
    return response.data;
  },

  async create(data: FormData) {
    const response = await api.post<ApiResponse<Document>>('/api/documents', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async update(id: number, data: FormData) {
    data.append('_method', 'PUT');
    const response = await api.post<ApiResponse<Document>>(`/api/documents/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete<ApiResponse<void>>(`/api/documents/${id}`);
    return response.data;
  },

  async download(id: number) {
    const response = await api.get(`/api/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response;
  },

  async toggleActive(id: number, isActive: boolean) {
    const response = await api.post<ApiResponse<Document>>(`/api/documents/${id}/toggle-active`, { is_active: isActive });
    return response.data;
  },


  async summarizeText(text: string, language: 'ne' | 'en' = 'ne') {
    const response = await api.post<ApiResponse<SummarizeResponse>>('/api/documents/summarize', {
      text: text.trim(),
      language: language,
    });
    return response.data;
  },
};