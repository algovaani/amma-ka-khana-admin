import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { cooksApi, AdminCook } from '../services/api/cooksApi';

const formatLabel = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const kycColor = (value: string): 'success' | 'warning' | 'error' | 'default' => {
  if (value === 'verified') return 'success';
  if (value === 'submitted' || value === 'pending_review') return 'warning';
  if (value === 'rejected') return 'error';
  return 'default';
};

const CooksPage = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<AdminCook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    cooksApi
      .list()
      .then((res) => {
        setRows(res.data.cooks);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (cookId: string, approved: boolean) => {
    setActionId(cookId);
    try {
      await cooksApi.approve(cookId, approved);
      load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not update cook');
    } finally {
      setActionId(null);
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Cook Name', flex: 1, minWidth: 140 },
    { field: 'phone', headerName: 'Phone', width: 130 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
    { field: 'city', headerName: 'City', width: 120 },
    { field: 'rating', headerName: 'Rating', width: 90 },
    { field: 'orders', headerName: 'Orders', width: 90 },
    {
      field: 'kyc',
      headerName: 'KYC',
      width: 120,
      renderCell: (params) => (
        <Chip label={formatLabel(params.value)} size="small" color={kycColor(params.value)} />
      ),
    },
    {
      field: 'fssai',
      headerName: 'FSSAI',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={formatLabel(params.value)}
          size="small"
          color={
            params.value === 'verified'
              ? 'success'
              : params.value === 'pending_review' || params.value === 'submitted'
                ? 'warning'
                : 'default'
          }
        />
      ),
    },
    {
      field: 'onboardingStep',
      headerName: 'Step',
      width: 140,
      renderCell: (params) => <Chip label={formatLabel(params.value)} size="small" variant="outlined" />,
    },
    {
      field: 'adminApproval',
      headerName: 'Admin',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={formatLabel(params.value)}
          size="small"
          color={
            params.value === 'approved' ? 'success' : params.value === 'rejected' ? 'error' : 'warning'
          }
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 220,
      sortable: false,
      renderCell: (params) => {
        const cook = params.row as AdminCook;
        const busy = actionId === cook.id;
        const canApproveProfile =
          cook.onboardingStep === 'admin_review' && cook.adminApproval === 'pending';
        const canVerifyFssai =
          cook.fssai === 'submitted' || cook.onboardingStep === 'fssai_review';

        return (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button size="small" onClick={() => navigate(`/cooks/${cook.id}`)}>
              View
            </Button>
            {canApproveProfile ? (
              <>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  disabled={busy}
                  onClick={() => handleApprove(cook.id, true)}
                >
                  Approve
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  disabled={busy}
                  onClick={() => handleApprove(cook.id, false)}
                >
                  Reject
                </Button>
              </>
            ) : null}
            {canVerifyFssai && !canApproveProfile ? (
              <Button size="small" variant="contained" color="info" onClick={() => navigate(`/cooks/${cook.id}`)}>
                Verify FSSAI
              </Button>
            ) : null}
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Cook Partners
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" onClick={() => navigate('/map/cooks')}>
            View map
          </Button>
          <Button variant="outlined" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </Box>
      </Box>

      {error ? (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      ) : null}

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

export default CooksPage;
