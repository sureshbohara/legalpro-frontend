import api from '@/lib/axios';
import { Payment, ApiResponse } from '@/types';

export const paymentService = {

  
  async create(invoiceId: number, data: any) {
    const response = await api.post<ApiResponse<Payment>>(`/api/invoices/${invoiceId}/payments`, data);
    return response.data;
  },

  async delete(paymentId: number) {
    const response = await api.delete<ApiResponse<void>>(`/api/payments/${paymentId}`);
    return response.data;
  },


  async searchByInvoice(invoiceNumber: string) {
    const response = await api.get<ApiResponse<any>>('/api/payments/by-invoice', { 
      params: { invoice_number: invoiceNumber } 
    });
    return response.data;
  },



};