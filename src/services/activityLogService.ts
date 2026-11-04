import api from '@/lib/axios';
import { ActivityLog, ApiResponse, PaginatedResponse } from '@/types';

export const activityLogService = {

  async getLogs(params?: { page?: number }) {
    const response = await api.get<ApiResponse<PaginatedResponse<ActivityLog>>>('/api/activity-logs', { params });
    return response.data;
  },
  
};