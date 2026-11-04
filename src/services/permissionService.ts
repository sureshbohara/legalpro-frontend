import api from '@/lib/axios';
import { Permission, ApiResponse } from '@/types';

export const permissionService = {

  async getAllPermissions() {
    const response = await api.get<ApiResponse<Permission[]>>('/api/permissions');
    return response.data;
  },

  async createPermission(name: string) {
    const response = await api.post<ApiResponse<Permission>>('/api/permissions', { name });
    return response.data;
  },

   async deletePermission(id: number) {
    const response = await api.delete<ApiResponse<void>>(`/api/permissions/${id}`);
    return response.data;
  },
  
  
};