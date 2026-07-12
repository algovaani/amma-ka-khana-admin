import { useEffect, useState } from 'react';
import { Box, Card, CardContent, CircularProgress, Grid, Typography } from '@mui/material';
import { shopApi, ShopDashboardStats } from '../../services/api/shopApi';

const StatCard = ({
  title,
  value,
  subtitle,
  color,
}: {
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
      {subtitle ? (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      ) : null}
    </CardContent>
  </Card>
);

const ShopDashboardPage = () => {
  const [stats, setStats] = useState<ShopDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    shopApi
      .getDashboardStats()
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
    return <Typography color="error">{error || 'Failed to load shop dashboard'}</Typography>;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard title="Total shop orders" value={String(stats.totalOrders)} color="#E65100" />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard title="Pending orders" value={String(stats.pendingOrders)} color="#FB8C00" />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard title="Today's orders" value={String(stats.todayOrders)} color="#1565C0" />
      </Grid>
      <Grid item xs={12} sm={6}>
        <StatCard
          title="Total shop revenue"
          value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
          color="#2E7D32"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <StatCard
          title="Today's revenue"
          value={`₹${stats.todayRevenue.toLocaleString('en-IN')}`}
          subtitle="Wallet payments from cooks"
          color="#388E3C"
        />
      </Grid>
    </Grid>
  );
};

export default ShopDashboardPage;
