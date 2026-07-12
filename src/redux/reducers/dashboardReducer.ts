import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  activeCooks: number;
  activeCustomers: number;
  walletBalance: number;
  cancellationRate: number;
  avgRating: number;
}

const initialState: DashboardStats = {
  totalOrders: 0,
  totalRevenue: 0,
  activeCooks: 0,
  activeCustomers: 0,
  walletBalance: 0,
  cancellationRate: 0,
  avgRating: 0,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setStats: (state, action: PayloadAction<Partial<DashboardStats>>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { setStats } = dashboardSlice.actions;
export default dashboardSlice.reducer;
