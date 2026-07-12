import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { reportsApi, ReportRow, ReportType } from '../services/api/reportsApi';

const formatLabel = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const formatMoney = (value?: number) => `₹${(value ?? 0).toLocaleString('en-IN')}`;

const REPORT_TYPES: Array<{ value: ReportType; label: string }> = [
  { value: 'orders', label: 'Orders' },
  { value: 'customers', label: 'Customers' },
  { value: 'cooks', label: 'Cooks' },
  { value: 'wallet', label: 'Wallet Transactions' },
  { value: 'coupons', label: 'Coupon Usage' },
  { value: 'cancelled', label: 'Cancelled Orders' },
  { value: 'revenue', label: 'Revenue (Daily)' },
];

const openTraceLink = (row: ReportRow) => {
  if (!row.linkType || !row.linkId) return;
  const path =
    row.linkType === 'order'
      ? `/orders/${row.linkId}`
      : row.linkType === 'cook'
        ? `/cooks/${row.linkId}`
        : `/users/${row.linkId}`;
  window.open(path, '_blank', 'noopener,noreferrer');
};

const ReportsPage = () => {
  const [type, setType] = useState<ReportType>('orders');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ReportRow | null>(null);

  const load = () => {
    setLoading(true);
    reportsApi
      .get({
        type,
        from: from || undefined,
        to: to || undefined,
        status: status || undefined,
        search: search || undefined,
        limit: 100,
      })
      .then((res) => {
        setRows(res.data.rows);
        setSummary(res.data.summary);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [type]);

  const columns: GridColDef[] = useMemo(() => {
    if (type === 'orders') {
      return [
        { field: 'traceId', headerName: 'Trace ID', width: 130 },
        { field: 'customer', headerName: 'Customer', flex: 1, minWidth: 120 },
        { field: 'cook', headerName: 'Cook', flex: 1, minWidth: 120 },
        { field: 'status', headerName: 'Status', width: 120 },
        { field: 'total', headerName: 'Total', width: 90, valueFormatter: (v) => formatMoney(v) },
        { field: 'couponCode', headerName: 'Coupon', width: 100 },
        {
          field: 'createdAt',
          headerName: 'Date',
          width: 170,
          valueFormatter: (v) => new Date(v).toLocaleString(),
        },
      ];
    }
    if (type === 'customers') {
      return [
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'phone', headerName: 'Phone', width: 130 },
        { field: 'status', headerName: 'Status', width: 110 },
        { field: 'orders', headerName: 'Orders', width: 90 },
        { field: 'totalSpent', headerName: 'Spent', width: 100, valueFormatter: (v) => formatMoney(v) },
        {
          field: 'registeredAt',
          headerName: 'Registered',
          width: 170,
          valueFormatter: (v) => new Date(v).toLocaleString(),
        },
      ];
    }
    if (type === 'cooks') {
      return [
        { field: 'name', headerName: 'Cook', flex: 1 },
        { field: 'kycStatus', headerName: 'KYC', width: 110 },
        { field: 'adminApproval', headerName: 'Approval', width: 110 },
        { field: 'availability', headerName: 'Status', width: 110 },
        { field: 'totalOrders', headerName: 'Orders', width: 90 },
        { field: 'rating', headerName: 'Rating', width: 80 },
      ];
    }
    if (type === 'wallet') {
      return [
        { field: 'user', headerName: 'User', flex: 1 },
        { field: 'type', headerName: 'Type', width: 100 },
        { field: 'amount', headerName: 'Amount', width: 100, valueFormatter: (v) => formatMoney(v) },
        { field: 'balanceAfter', headerName: 'Balance', width: 100, valueFormatter: (v) => formatMoney(v) },
        { field: 'description', headerName: 'Description', flex: 1, minWidth: 160 },
        {
          field: 'createdAt',
          headerName: 'Date',
          width: 170,
          valueFormatter: (v) => new Date(v).toLocaleString(),
        },
      ];
    }
    if (type === 'coupons') {
      return [
        { field: 'couponCode', headerName: 'Code', width: 110 },
        { field: 'user', headerName: 'User', flex: 1 },
        { field: 'orderNumber', headerName: 'Order', width: 130 },
        { field: 'discountAmount', headerName: 'Discount', width: 100, valueFormatter: (v) => formatMoney(v) },
        {
          field: 'createdAt',
          headerName: 'Date',
          width: 170,
          valueFormatter: (v) => new Date(v).toLocaleString(),
        },
      ];
    }
    if (type === 'cancelled') {
      return [
        { field: 'orderNumber', headerName: 'Order', width: 130 },
        { field: 'customer', headerName: 'Customer', flex: 1 },
        { field: 'cook', headerName: 'Cook', flex: 1 },
        { field: 'cancelReason', headerName: 'Reason', flex: 1, minWidth: 160 },
        { field: 'total', headerName: 'Total', width: 90, valueFormatter: (v) => formatMoney(v) },
      ];
    }
    return [
      { field: 'date', headerName: 'Date', width: 120 },
      { field: 'orders', headerName: 'Orders', width: 90 },
      { field: 'completed', headerName: 'Completed', width: 100 },
      { field: 'revenue', headerName: 'Revenue', width: 110, valueFormatter: (v) => formatMoney(v) },
      { field: 'discount', headerName: 'Discount', width: 100, valueFormatter: (v) => formatMoney(v) },
      { field: 'tax', headerName: 'GST', width: 90, valueFormatter: (v) => formatMoney(v) },
    ];
  }, [type]);

  const statusOptions = useMemo(() => {
    if (type === 'orders' || type === 'cancelled') {
      return ['pending', 'accepted', 'cooking', 'ready', 'completed', 'cancelled'];
    }
    if (type === 'customers') return ['active', 'inactive', 'suspended', 'pending_verification'];
    if (type === 'cooks') return ['approved', 'pending', 'rejected', 'available', 'offline'];
    return [];
  }, [type]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Reports
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Filter by report type, date range, and status. Click a row to trace full details.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {Object.entries(summary).map(([key, value]) => (
          <Grid item xs={12} sm={6} md={3} key={key}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {formatLabel(key)}
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {key.toLowerCase().includes('revenue') || key.toLowerCase().includes('discount') || key.toLowerCase().includes('spent')
                    ? formatMoney(value)
                    : value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Report type</InputLabel>
          <Select label="Report type" value={type} onChange={(e) => setType(e.target.value as ReportType)}>
            {REPORT_TYPES.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          label="From"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          size="small"
          label="To"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        {statusOptions.length > 0 ? (
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {statusOptions.map((item) => (
                <MenuItem key={item} value={item}>
                  {formatLabel(item)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : null}
        <TextField
          size="small"
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 180 }}
        />
        <Button variant="contained" onClick={load} disabled={loading}>
          Apply
        </Button>
      </Box>

      {error ? <Typography color="error" sx={{ mb: 2 }}>{error}</Typography> : null}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={rows}
          columns={[
            ...columns,
            {
              field: 'actions',
              headerName: 'Trace',
              width: 120,
              sortable: false,
              renderCell: (params) => (
                <Button size="small" onClick={() => setSelected(params.row)}>
                  Details
                </Button>
              ),
            },
          ]}
          getRowId={(row) => row.id}
          autoHeight
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          onRowClick={(params) => setSelected(params.row)}
          disableRowSelectionOnClick
        />
      )}

      <Dialog open={!!selected} onClose={() => setSelected(null)} fullWidth maxWidth="md">
        <DialogTitle>Report trace details</DialogTitle>
        <DialogContent>
          {selected ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Chip label={formatLabel(type)} size="small" sx={{ alignSelf: 'flex-start', mb: 1 }} />
              {Object.entries(selected)
                .filter(([key]) => !['linkType', 'linkId'].includes(key))
                .map(([key, value]) => (
                  <Typography key={key}>
                    <strong>{formatLabel(key)}:</strong>{' '}
                    {value instanceof Date || (typeof value === 'string' && value.includes('T') && !Number.isNaN(Date.parse(value)))
                      ? new Date(value as string).toLocaleString()
                      : typeof value === 'number' && (key.includes('total') || key.includes('amount') || key.includes('revenue') || key.includes('discount') || key.includes('tax') || key.includes('Spent'))
                        ? formatMoney(value)
                        : String(value ?? '—')}
                  </Typography>
                ))}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          {selected?.linkType && selected?.linkId ? (
            <Button onClick={() => openTraceLink(selected)}>Open linked record</Button>
          ) : null}
          <Button onClick={() => setSelected(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportsPage;
