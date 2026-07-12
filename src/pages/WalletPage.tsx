import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Link,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  walletApi,
  AdminWalletItem,
  AdminWalletTransaction,
  WalletOverviewResponse,
} from '../services/api/walletApi';

const formatLabel = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const formatMoney = (value?: number) => `₹${(value ?? 0).toLocaleString('en-IN')}`;

const openUserDetail = (userId: string, role: string) => {
  const path = role === 'cook' ? `/cooks/${userId}` : `/users/${userId}`;
  window.open(path, '_blank', 'noopener,noreferrer');
};

const UserNameLink = ({ userId, userName, userRole }: { userId: string; userName: string; userRole: string }) => (
  <Link
    component="button"
    variant="body2"
    onClick={() => openUserDetail(userId, userRole)}
    sx={{ fontWeight: 600, textAlign: 'left' }}
  >
    {userName}
  </Link>
);

const StatCard = ({
  title,
  value,
  subtitle,
  color = 'text.primary',
}: {
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
}) => (
  <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
    <CardContent>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h5" fontWeight={700} color={color}>
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

const WalletPage = () => {
  const [data, setData] = useState<WalletOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);

  const load = () => {
    setLoading(true);
    walletApi
      .getOverview({ limit: 200 })
      .then((res) => {
        setData(res.data);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const walletColumns: GridColDef<AdminWalletItem>[] = [
    {
      field: 'userName',
      headerName: 'User',
      flex: 1,
      minWidth: 160,
      renderCell: (params) => (
        <UserNameLink userId={params.row.userId} userName={params.row.userName} userRole={params.row.userRole} />
      ),
    },
    {
      field: 'userRole',
      headerName: 'Role',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={formatLabel(params.value)}
          size="small"
          color={params.value === 'cook' ? 'primary' : 'default'}
          variant="outlined"
        />
      ),
    },
    { field: 'phone', headerName: 'Phone', width: 130 },
    {
      field: 'balance',
      headerName: 'Balance',
      width: 120,
      valueFormatter: (value) => formatMoney(value),
    },
    {
      field: 'isOnHold',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'On Hold' : 'Active'}
          size="small"
          color={params.value ? 'error' : 'success'}
        />
      ),
    },
    {
      field: 'updatedAt',
      headerName: 'Last Updated',
      width: 180,
      valueFormatter: (value) => new Date(value).toLocaleString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button size="small" onClick={() => openUserDetail(params.row.userId, params.row.userRole)}>
          View
        </Button>
      ),
    },
  ];

  const transactionColumns: GridColDef<AdminWalletTransaction>[] = [
    { field: 'id', headerName: 'Txn ID', width: 120 },
    {
      field: 'userName',
      headerName: 'User',
      flex: 1,
      minWidth: 160,
      renderCell: (params) => (
        <UserNameLink userId={params.row.userId} userName={params.row.userName} userRole={params.row.userRole} />
      ),
    },
    {
      field: 'userRole',
      headerName: 'Role',
      width: 110,
      renderCell: (params) => (
        <Chip label={formatLabel(params.value)} size="small" variant="outlined" />
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={formatLabel(params.value)}
          size="small"
          color={
            params.value === 'credit' || params.value === 'refund' || params.value === 'cashback'
              ? 'success'
              : params.value === 'debit'
                ? 'warning'
                : 'default'
          }
        />
      ),
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      renderCell: (params) => {
        const isCredit = ['credit', 'refund', 'cashback', 'referral_bonus'].includes(params.row.type);
        return (
          <Typography color={isCredit ? 'success.main' : 'error.main'} fontWeight={600}>
            {isCredit ? '+' : '-'}{formatMoney(params.value)}
          </Typography>
        );
      },
    },
    {
      field: 'balanceAfter',
      headerName: 'Balance After',
      width: 130,
      valueFormatter: (value) => formatMoney(value),
    },
    { field: 'description', headerName: 'Description', flex: 1, minWidth: 180 },
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
        <Button size="small" onClick={() => openUserDetail(params.row.userId, params.row.userRole)}>
          View
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Wallet & Transactions
        </Typography>
        <Typography color="error">{error || 'Failed to load wallet data'}</Typography>
      </Box>
    );
  }

  const { summary, wallets, transactions } = data;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Wallet & Transactions
        </Typography>
        <Button variant="outlined" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </Box>

      {error ? <Typography color="error" sx={{ mb: 2 }}>{error}</Typography> : null}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Wallet Balance" value={formatMoney(summary.totalBalance)} color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Wallets"
            value={String(summary.activeWallets)}
            subtitle={`${summary.onHoldWallets} on hold`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Customer Wallets"
            value={String(summary.customersWithWallet)}
            subtitle={`${summary.cooksWithWallet} cook wallets`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Activity"
            value={String(summary.todayTransactions)}
            subtitle={`+${formatMoney(summary.todayCredits)} / -${formatMoney(summary.todayDebits)}`}
          />
        </Grid>
      </Grid>

      <Card sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`All Wallets (${wallets.length})`} />
          <Tab label={`Transactions (${summary.transactionCount})`} />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {tab === 0 ? (
            <DataGrid
              rows={wallets}
              columns={walletColumns}
              getRowId={(row) => row.id}
              autoHeight
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              disableRowSelectionOnClick
            />
          ) : (
            <DataGrid
              rows={transactions}
              columns={transactionColumns}
              getRowId={(row) => row.id}
              autoHeight
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              disableRowSelectionOnClick
            />
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default WalletPage;
