import { useEffect, useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { supportApi, SupportTicketItem, SupportSummary } from '../services/api/supportApi';

const formatLabel = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const statusColor = (status: string): 'default' | 'warning' | 'primary' | 'success' | 'error' => {
  if (status === 'open') return 'warning';
  if (status === 'in_progress') return 'primary';
  if (status === 'resolved') return 'success';
  if (status === 'closed') return 'default';
  return 'default';
};

const openUserLink = (ticket: SupportTicketItem) => {
  if (!ticket.userId) return;
  const path = ticket.userRole === 'cook' ? `/cooks/${ticket.userId}` : `/users/${ticket.userId}`;
  window.open(path, '_blank', 'noopener,noreferrer');
};

const SupportPage = () => {
  const [summary, setSummary] = useState<SupportSummary | null>(null);
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<SupportTicketItem | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    type: 'general',
    priority: 'medium',
    userName: '',
    userPhone: '',
    orderNumber: '',
  });

  const load = () => {
    setLoading(true);
    Promise.all([
      supportApi.getSummary(),
      supportApi.list({
        type: type || undefined,
        status: status || undefined,
        search: search || undefined,
        limit: 100,
      }),
    ])
      .then(([summaryRes, listRes]) => {
        setSummary(summaryRes.data);
        setTickets(listRes.data.tickets);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openTicket = (ticket: SupportTicketItem) => {
    setSelected(ticket);
    setAdminNotes(ticket.adminNotes ?? '');
    setUpdateStatus(ticket.status);
  };

  const handleUpdate = async () => {
    if (!selected) return;
    try {
      await supportApi.update(selected.id, {
        status: updateStatus,
        adminNotes,
      });
      setSelected(null);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const handleCreate = async () => {
    try {
      await supportApi.create({
        subject: newTicket.subject.trim(),
        message: newTicket.message.trim(),
        type: newTicket.type,
        priority: newTicket.priority,
        userName: newTicket.userName.trim() || undefined,
        userPhone: newTicket.userPhone.trim() || undefined,
        orderNumber: newTicket.orderNumber.trim() || undefined,
      });
      setCreateOpen(false);
      setNewTicket({
        subject: '',
        message: '',
        type: 'general',
        priority: 'medium',
        userName: '',
        userPhone: '',
        orderNumber: '',
      });
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Create failed');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Support
        </Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          New Ticket
        </Button>
      </Box>

      {summary ? (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} md={3}>
            <Card><CardContent><Typography color="text.secondary">Open</Typography><Typography variant="h5" fontWeight={700}>{summary.open}</Typography></CardContent></Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card><CardContent><Typography color="text.secondary">In Progress</Typography><Typography variant="h5" fontWeight={700}>{summary.inProgress}</Typography></CardContent></Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card><CardContent><Typography color="text.secondary">Resolved</Typography><Typography variant="h5" fontWeight={700}>{summary.resolved}</Typography></CardContent></Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card><CardContent><Typography color="text.secondary">Total</Typography><Typography variant="h5" fontWeight={700}>{summary.total}</Typography></CardContent></Card>
          </Grid>
        </Grid>
      ) : null}

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select label="Type" value={type} onChange={(e) => setType(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {['order_issue', 'delivery', 'food_quality', 'wallet', 'kyc', 'fssai', 'earnings', 'shop', 'menu', 'payment', 'account', 'general'].map((item) => (
              <MenuItem key={item} value={item}>{formatLabel(item)}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {['open', 'in_progress', 'resolved', 'closed'].map((item) => (
              <MenuItem key={item} value={item}>{formatLabel(item)}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField size="small" label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button variant="outlined" onClick={load} disabled={loading}>Refresh</Button>
      </Box>

      {error ? <Typography color="error" sx={{ mb: 2 }}>{error}</Typography> : null}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Ticket #</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id} hover sx={{ cursor: 'pointer' }} onClick={() => openTicket(ticket)}>
                <TableCell>{ticket.ticketNumber}</TableCell>
                <TableCell>{ticket.userName}</TableCell>
                <TableCell>{formatLabel(ticket.type)}</TableCell>
                <TableCell>{ticket.subject}</TableCell>
                <TableCell><Chip label={formatLabel(ticket.status)} size="small" color={statusColor(ticket.status)} /></TableCell>
                <TableCell>{formatLabel(ticket.priority)}</TableCell>
                <TableCell>{new Date(ticket.createdAt).toLocaleString()}</TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={(e) => { e.stopPropagation(); openTicket(ticket); }}>View</Button>
                </TableCell>
              </TableRow>
            ))}
            {tickets.length === 0 ? (
              <TableRow><TableCell colSpan={8}>No support tickets found</TableCell></TableRow>
            ) : null}
          </TableBody>
        </Table>
      )}

      <Dialog open={!!selected} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
        <DialogTitle>{selected?.ticketNumber} — {selected?.subject}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {selected ? (
            <>
              <Typography><strong>User:</strong> {selected.userName} ({selected.userPhone})</Typography>
              <Typography><strong>Type:</strong> {formatLabel(selected.type)}</Typography>
              {selected.orderNumber ? <Typography><strong>Order:</strong> {selected.orderNumber}</Typography> : null}
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{selected.message}</Typography>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select label="Status" value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)}>
                  {['open', 'in_progress', 'resolved', 'closed'].map((item) => (
                    <MenuItem key={item} value={item}>{formatLabel(item)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Admin notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                multiline
                rows={4}
                fullWidth
              />
            </>
          ) : null}
        </DialogContent>
        <DialogActions>
          {selected?.userId ? (
            <Button onClick={() => openUserLink(selected)}>Open user</Button>
          ) : null}
          {selected?.orderId ? (
            <Button onClick={() => window.open(`/orders/${selected.orderId}`, '_blank')}>Open order</Button>
          ) : null}
          <Button variant="contained" onClick={handleUpdate}>Save</Button>
          <Button onClick={() => setSelected(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create support ticket</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Subject" value={newTicket.subject} onChange={(e) => setNewTicket((p) => ({ ...p, subject: e.target.value }))} fullWidth />
          <TextField label="Message" value={newTicket.message} onChange={(e) => setNewTicket((p) => ({ ...p, message: e.target.value }))} multiline rows={4} fullWidth />
          <TextField label="User name" value={newTicket.userName} onChange={(e) => setNewTicket((p) => ({ ...p, userName: e.target.value }))} fullWidth />
          <TextField label="User phone" value={newTicket.userPhone} onChange={(e) => setNewTicket((p) => ({ ...p, userPhone: e.target.value }))} fullWidth />
          <TextField label="Order number (optional)" value={newTicket.orderNumber} onChange={(e) => setNewTicket((p) => ({ ...p, orderNumber: e.target.value }))} fullWidth />
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select label="Type" value={newTicket.type} onChange={(e) => setNewTicket((p) => ({ ...p, type: e.target.value }))}>
              {['order_issue', 'delivery', 'food_quality', 'wallet', 'kyc', 'fssai', 'earnings', 'shop', 'menu', 'payment', 'account', 'general'].map((item) => (
                <MenuItem key={item} value={item}>{formatLabel(item)}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!newTicket.subject.trim() || !newTicket.message.trim()}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupportPage;
