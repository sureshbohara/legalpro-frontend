import api from '@/lib/axios';
import { ApiResponse, Notification } from '@/types';

interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  unread_count: number;
}

export const notificationService = {
  async getNotifications() {
    const response = await api.get<NotificationsResponse>('/api/notifications');
    return response.data;
  },

  async getUnreadCount() {
    const response = await api.get<{ success: boolean; count: number }>('/api/notifications/unread-count');
    return response.data;
  },

  async markAsRead(notificationId: string) {
    const response = await api.post<ApiResponse<null>>(`/api/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.post<ApiResponse<null>>('/api/notifications/mark-all-read');
    return response.data;
  },

  async delete(notificationId: string) {
    const response = await api.delete<ApiResponse<null>>(`/api/notifications/${notificationId}`);
    return response.data;
  },
};