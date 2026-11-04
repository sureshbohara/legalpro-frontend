import api from '@/lib/axios';
import { ApiResponse } from '@/types';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('client_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const clientPortalService = {
  async login(email: string, password: string) {
    const response = await api.post<ApiResponse<any>>('/api/client/login', { email, password });
    return response.data;
  },

  async logout() {
    const response = await api.post<ApiResponse<void>>('/api/client/logout', {}, { headers: getAuthHeaders() });
    return response.data;
  },

  async getProfile() {
    const response = await api.get<ApiResponse<any>>('/api/client/profile', { headers: getAuthHeaders() });
    return response.data;
  },

  async getCases() {
    const response = await api.get<ApiResponse<any[]>>('/api/client/cases', { headers: getAuthHeaders() });
    return response.data;
  },

  async getInvoices() {
    const response = await api.get<ApiResponse<any[]>>('/api/client/invoices', { headers: getAuthHeaders() });
    return response.data;
  },

  async getDocuments() {
    const response = await api.get<ApiResponse<any[]>>('/api/client/documents', { headers: getAuthHeaders() });
    return response.data;
  },

  async downloadDocument(id: number) {
    const response = await api.get(`/api/documents/${id}/download`, {
      headers: getAuthHeaders(),
      responseType: 'blob', 
    });
    return response;
  },
};