import apiClient from './client';

export interface DashboardStatsResponse {
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  activeCooks: number;
  totalCooks: number;
  activeCustomers: number;
  walletBalance: number;
  cancellationRate: number;
  avgRating: number;
  charts: {
    dailyOrders: { categories: string[]; data: number[] };
    monthlyRevenue: { categories: string[]; data: number[] };
  };
}

export const dashboardApi = {
  getStats: () => apiClient.get('/admin/dashboard/stats') as Promise<{ data: DashboardStatsResponse }>,
};
