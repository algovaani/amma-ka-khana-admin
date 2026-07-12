import { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import Chart from 'react-apexcharts';
import { dashboardApi, DashboardStatsResponse } from '../services/api/dashboardApi';

const StatCard = ({ title, value, subtitle, color }: {
  title: string;
  value: string;
  subtitle?: string;
  color: string;
}) => (
  <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
    <CardContent>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" fontWeight={700} color={color}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi
      .getStats()
      .then((res) => {
        setStats(res.data);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return <Typography color="error">{error || 'Failed to load dashboard'}</Typography>;
  }

  const ordersChart = {
    options: {
      chart: { toolbar: { show: false } },
      xaxis: { categories: stats.charts.dailyOrders.categories },
      colors: ['#E65100'],
    },
    series: [{ name: 'Orders', data: stats.charts.dailyOrders.data }],
  };

  const revenueChart = {
    options: {
      chart: { toolbar: { show: false } },
      xaxis: { categories: stats.charts.monthlyRevenue.categories },
      colors: ['#4CAF50'],
    },
    series: [{ name: 'Revenue (₹)', data: stats.charts.monthlyRevenue.data }],
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Dashboard
      </Typography>

      {error ? (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      ) : null}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={stats.totalOrders.toLocaleString()}
            color="#E65100"
            subtitle={`${stats.completedOrders} completed`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            color="#4CAF50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Cooks"
            value={String(stats.activeCooks)}
            color="#1976D2"
            subtitle={`${stats.totalCooks} registered`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Customers"
            value={stats.activeCustomers.toLocaleString()}
            color="#9C27B0"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 2 }}>
            <Typography variant="h6" gutterBottom>Daily Orders (Last 7 days)</Typography>
            <Chart options={ordersChart.options} series={ordersChart.series} type="bar" height={280} />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 2 }}>
            <Typography variant="h6" gutterBottom>Revenue Trend</Typography>
            <Chart options={revenueChart.options} series={revenueChart.series} type="area" height={280} />
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Wallet Balance"
            value={`₹${stats.walletBalance.toLocaleString()}`}
            color="#FF8F00"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Cancellation Rate"
            value={`${stats.cancellationRate}%`}
            color="#D32F2F"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard title="Avg Rating" value={`${stats.avgRating} ★`} color="#FFC107" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
