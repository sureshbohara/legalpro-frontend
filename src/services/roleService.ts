import api from '@/lib/axios';
import { Role, Permission, ApiResponse } from '@/types';

export const roleService = {
  
  async getAllRoles() {
    const response = await api.get<ApiResponse<Role[]>>('/api/roles');
    return response.data;
  },

  async createRole(name: string) {
    const response = await api.post<ApiResponse<Role>>('/api/roles', { name });
    return response.data;
  },

  async updateRole(id: number, name: string) {
    const response = await api.put<ApiResponse<Role>>(`/api/roles/${id}`, { name });
    return response.data;
  },

  async deleteRole(id: number) {
    const response = await api.delete<ApiResponse<void>>(`/api/roles/${id}`);
    return response.data;
  },

  async assignPermissions(id: number, permissionIds: number[]) {
    const response = await api.post<ApiResponse<Role>>(`/api/roles/${id}/permissions`, {
      permission_ids: permissionIds,
    });
    return response.data;
  },
};