import api from '@/lib/axios';
import { Task, ApiResponse, PaginatedResponse } from '@/types';

export const taskService = {

  async getAll(params?: { 
    search?: string; 
    status?: string; 
    priority?: string; 
    assigned_to?: string; 
    case_id?: string; 
    overdue?: string;
    page?: number 
  }) {
    const response = await api.get<ApiResponse<PaginatedResponse<Task>>>('/api/tasks', { params });
    return response.data;
  },


  async getTask(id: number) {
    const response = await api.get<ApiResponse<{ task: Task }>>(`/api/tasks/${id}`);
    return response.data;
  },


  async create(data: Partial<Task>) {
    const response = await api.post<ApiResponse<Task>>('/api/tasks', data);
    return response.data;
  },


  async update(id: number, data: Partial<Task>) {
    const response = await api.put<ApiResponse<Task>>(`/api/tasks/${id}`, data);
    return response.data;
  },


  async delete(id: number) {
    const response = await api.delete<ApiResponse<void>>(`/api/tasks/${id}`);
    return response.data;
  },


  async toggleActive(id: number, isActive: boolean) {
    const response = await api.post<ApiResponse<Task>>(`/api/tasks/${id}/toggle-active`, { is_active: isActive });
    return response.data;
  },
  
};