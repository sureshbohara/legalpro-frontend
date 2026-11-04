import api from '@/lib/axios';

export interface DashboardStats {
  total_active_cases: number;
  total_clients: number;
  upcoming_hearings: number;
  total_categories: number;

  total_revenue: number;
  total_outstanding: number;
  pending_invoices_count: number;
  recent_invoices: Array<{
    id: number;
    invoice_number: string;
    client_name: string;
    total_amount: number;
    paid_amount: number;
    status: string;
    created_at: string;
  }>;
 
  cases_by_category: Array<{ name: string; value: number; color: string }>;
  cases_by_status: Array<{ name: string; value: number; color: string }>;
  next_hearings: Array<{
    id: number;
    case_number: string;
    case_title: string;
    court_name: string;
    hearing_date: string;
    hearing_time: string | null;
  }>;
  recent_activities: Array<{
    id: number;
    description: string;
    user_name: string;
    created_at: string;
  }>;
}

export const dashboardService = {
  async getStats() {
    const response = await api.get<{ success: boolean; stats: DashboardStats }>('/api/dashboard/stats');
    return response.data;
  },
};