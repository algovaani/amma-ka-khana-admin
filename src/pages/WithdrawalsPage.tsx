import { useCallback, useEffect, useState } from 'react';
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
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { withdrawApi, AdminWithdrawRequest } from '../services/api/withdrawApi';

const statusColor = (status: string): 'default' | 'warning' | 'success' | 'error' | 'info' => {
  if (status === 'paid') return 'success';
  if (status === 'rejected') return 'error';
  if (status === 'approved') return 'info';
  return 'warning';
};

const WithdrawalsPage = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('pending');
  const [requests, setRequests] = useState<AdminWithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [payDialog, setPayDialog] = useState<AdminWithdrawRequest | null>(null);
  const [payoutReference, setPayoutReference] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    withdrawApi
      .list(statusFilter || undefined)
      .then((res) => setRequests(res.data.requests))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleReview = async (req: AdminWithdrawRequest, approved: boolean) => {
    setActionLoading(true);
    try {
      await withdrawApi.review(req.id, approved);
      load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!payDialog || !payoutReference.trim()) return;
    setActionLoading(true);
    try {
      await withdrawApi.markPaid(payDialog.id, payoutReference.trim(), adminNote.trim() || undefined);
      setPayDialog(null);
      setPayoutReference('');
      setAdminNote('');
      load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to mark paid');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Cook withdrawal requests
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Verify bank details on cook profile, approve request, then mark paid after bank transfer.
      </Typography>

      <FormControl size="small" sx={{ minWidth: 180, mb: 2 }}>
        <InputLabel>Status</InputLabel>
        <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="paid">Paid</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
        </Select>
      </FormControl>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">No withdrawal requests</Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cook</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Bank</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Requested</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((req) => {
                const bank = req.bankDetailsFull ?? req.bankDetails;
                return (
                  <TableRow key={req.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>{req.cook.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {req.cook.phone}
                      </Typography>
                      <Button size="small" onClick={() => navigate(`/cooks/${req.cook.id}`)}>
                        View profile
                      </Button>
                    </TableCell>
                    <TableCell>₹{req.amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{bank.accountHolder}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {bank.bankName} · {bank.accountNumber} · {bank.ifsc}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={req.status} color={statusColor(req.status)} size="small" />
                    </TableCell>
                    <TableCell>{new Date(req.createdAt).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      {req.status === 'pending' ? (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            disabled={actionLoading}
                            onClick={() => handleReview(req, true)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            disabled={actionLoading}
                            onClick={() => handleReview(req, false)}
                          >
                            Reject
                          </Button>
                        </Box>
                      ) : null}
                      {req.status === 'approved' ? (
                        <Button
                          size="small"
                          variant="contained"
                          disabled={actionLoading}
                          onClick={() => setPayDialog(req)}
                        >
                          Mark paid
                        </Button>
                      ) : null}
                      {req.payoutReference ? (
                        <Typography variant="caption" display="block">
                          UTR: {req.payoutReference}
                        </Typography>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={!!payDialog} onClose={() => setPayDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Mark withdrawal as paid</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Transfer ₹{payDialog?.amount.toLocaleString('en-IN')} to cook bank account, then enter UTR/reference.
          </Typography>
          <TextField
            fullWidth
            label="UTR / payout reference"
            value={payoutReference}
            onChange={(e) => setPayoutReference(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Admin note (optional)"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayDialog(null)}>Cancel</Button>
          <Button variant="contained" disabled={actionLoading || !payoutReference.trim()} onClick={handleMarkPaid}>
            Confirm paid
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WithdrawalsPage;
