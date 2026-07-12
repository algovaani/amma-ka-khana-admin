import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Chip, CircularProgress, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { usersApi, AdminUserListItem } from '../services/api/usersApi';

const formatLabel = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const statusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
  if (status === 'active') return 'success';
  if (status === 'suspended') return 'error';
  if (status === 'inactive' || status === 'pending_verification') return 'warning';
  return 'default';
};

const UsersPage = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    usersApi
      .list()
      .then((res) => {
        setRows(res.data.users);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 140 },
    { field: 'phone', headerName: 'Phone', width: 130 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
    { field: 'city', headerName: 'City', width: 120 },
    { field: 'orders', headerName: 'Orders', width: 90 },
    {
      field: 'walletBalance',
      headerName: 'Wallet',
      width: 100,
      valueFormatter: (value) => `₹${value}`,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip label={formatLabel(params.value)} size="small" color={statusColor(params.value)} />
      ),
    },
    {
      field: 'walletHold',
      headerName: 'Wallet Hold',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'On Hold' : 'Active'}
          size="small"
          color={params.value ? 'error' : 'success'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button size="small" onClick={() => navigate(`/users/${params.row.id}`)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Customers
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

export default UsersPage;
