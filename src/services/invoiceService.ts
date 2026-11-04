import api from '@/lib/axios';
import { Invoice, ApiResponse, PaginatedResponse } from '@/types';

export const invoiceService = {

  async getAll(params?: { search?: string; status?: string; client_id?: string; page?: number }) {
    const response = await api.get<ApiResponse<PaginatedResponse<Invoice>>>('/api/invoices', { params });
    return response.data;
  },

  async getInvoice(id: number) {
    const response = await api.get<ApiResponse<{ invoice: Invoice }>>(`/api/invoices/${id}`);
    return response.data;
  },

  async create(data: any) {
    const response = await api.post<ApiResponse<Invoice>>('/api/invoices', data);
    return response.data;
  },

  async update(id: number, data: any) {
    const response = await api.put<ApiResponse<Invoice>>(`/api/invoices/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete<ApiResponse<void>>(`/api/invoices/${id}`);
    return response.data;
  },

  async updateStatus(id: number, status: string) {
    const response = await api.post<ApiResponse<Invoice>>(`/api/invoices/${id}/status`, { status });
    return response.data;
  },


  async downloadPdf(id: number) {
    const response = await api.get(`/api/invoices/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
  

  async sendReminder(id: number) {
    const response = await api.post<ApiResponse<void>>(`/api/invoices/${id}/send-reminder`);
    return response.data;
  },

  
};