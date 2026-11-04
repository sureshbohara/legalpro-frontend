import api from '@/lib/axios';
import { TimeEntry, TimeEntrySummary, ApiResponse, PaginatedResponse } from '@/types';

export const timeEntryService = {
  async getAll(params?: { 
    search?: string; 
    user_id?: string; 
    case_id?: string;
    status?: string;
    is_billable?: string;
    date_from?: string;
    date_to?: string;
    page?: number 
  }) {
    const response = await api.get<ApiResponse<PaginatedResponse<TimeEntry>> & { summary?: TimeEntrySummary }>('/api/time-entries', { params });
    return response.data;
  },

  async getEntry(id: number) {
    const response = await api.get<ApiResponse<{ entry: TimeEntry }>>(`/api/time-entries/${id}`);
    return response.data;
  },

  async create(data: Partial<TimeEntry>) {
    const response = await api.post<ApiResponse<TimeEntry>>('/api/time-entries', data);
    return response.data;
  },

  async update(id: number, data: Partial<TimeEntry>) {
    const response = await api.put<ApiResponse<TimeEntry>>(`/api/time-entries/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete<ApiResponse<void>>(`/api/time-entries/${id}`);
    return response.data;
  },


  async getApprovedEntries(params?: { case_id?: number; client_id?: number }) {
    const response = await api.get<ApiResponse<{ entries: any[] }>>('/api/time-entries/approved', { params });
    return response.data;
  },

  async updateStatus(id: number, status: string) {
    const response = await api.post<ApiResponse<TimeEntry>>(`/api/time-entries/${id}/status`, { status });
    return response.data;
  },
};