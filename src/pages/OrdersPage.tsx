import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Chip, CircularProgress, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ordersApi, AdminOrderListItem } from '../services/api/ordersApi';

const formatLabel = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const statusColors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  pending: 'warning',
  accepted: 'primary',
  cooking: 'primary',
  ready: 'success',
  picked: 'success',
  code_pending: 'primary',
  completed: 'success',
  cancelled: 'error',
  rejected: 'error',
  refunded: 'error',
};

const OrdersPage = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<AdminOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    ordersApi
      .list({ limit: 100 })
      .then((res) => {
        setRows(res.data.orders);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const columns: GridColDef[] = [
    { field: 'orderNumber', headerName: 'Order #', width: 140 },
    { field: 'customer', headerName: 'Customer', flex: 1, minWidth: 140 },
    { field: 'cook', headerName: 'Cook', flex: 1, minWidth: 140 },
    {
      field: 'total',
      headerName: 'Total',
      width: 100,
      valueFormatter: (value) => `₹${value}`,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={formatLabel(params.value)}
          size="small"
          color={statusColors[params.value as string] || 'default'}
        />
      ),
    },
    {
      field: 'paymentStatus',
      headerName: 'Payment',
      width: 120,
      renderCell: (params) => (
        <Chip label={formatLabel(params.value)} size="small" variant="outlined" />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Date',
      width: 180,
      valueFormatter: (value) => new Date(value).toLocaleString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button size="small" onClick={() => navigate(`/orders/${params.row.id}`)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Orders
        </Typography>
        <Button variant="outlined" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </Box>

      {error ? <Typography color="error" sx={{ mb: 2 }}>{error}</Typography> : null}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          autoHeight
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
        />
      )}
    </Box>
  );
};

export default OrdersPage;
