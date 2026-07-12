import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Pagination,
  Stack,
} from '@mui/material';
import { referralApi } from '../services/api/referralApi';
import type { AdminReferralRow } from '../services/api/settingsApi';

const ReferralsPage = () => {
  const [rows, setRows] = useState<AdminReferralRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await referralApi.list(page, 30);
      setRows(res.data.referrals);
      setTotalPages(res.data.totalPages);
    } catch {
      setRows([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Referrals
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Track referral links, bonus amounts paid, and pending first-order rewards.
      </Typography>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Referrer</TableCell>
              <TableCell>Referee</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Referrer ₹</TableCell>
              <TableCell align="right">Referee ₹</TableCell>
              <TableCell>Trigger</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8}>Loading...</TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>No referrals yet</TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {row.referrer.name || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.referrer.referralCode || row.referrer.phone || row.referrer.id.slice(-6)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.referee.name || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.referee.phone || row.referee.id.slice(-6)}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.referee.role}</TableCell>
                  <TableCell align="right">₹{row.referrerAmount}</TableCell>
                  <TableCell align="right">₹{row.refereeAmount}</TableCell>
                  <TableCell>{row.trigger.replace('_', ' ')}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.status}
                      color={row.status === 'completed' ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(row.completedAt || row.createdAt).toLocaleDateString('en-IN')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {totalPages > 1 ? (
        <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
          <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
        </Stack>
      ) : null}
    </Box>
  );
};

export default ReferralsPage;
