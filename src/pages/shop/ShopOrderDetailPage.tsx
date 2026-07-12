import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Step,
  StepLabel,
  Stepper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  ContentCopy,
  LocalShipping,
  LocationOn,
  OpenInNew,
  Phone,
  Email,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { shopApi, ShopOrder } from '../../services/api/shopApi';
import { resolveUploadUrl } from '../../utils/resolveUploadUrl';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const NEXT_STATUS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* ignore */
  }
};

const ShopOrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<ShopOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [nextStatus, setNextStatus] = useState('');
  const [note, setNote] = useState('');
  const [trackingNote, setTrackingNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!orderId) return;
    setLoading(true);
    shopApi
      .getOrder(orderId)
      .then((res) => {
        setOrder(res.data.order);
        setTrackingNote(res.data.order.trackingNote ?? '');
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [orderId]);

  const handleUpdateStatus = async () => {
    if (!orderId || !nextStatus) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await shopApi.updateOrderStatus(
        orderId,
        nextStatus,
        note.trim() || undefined,
        trackingNote.trim() || undefined
      );
      setOrder(res.data.order);
      setTrackingNote(res.data.order.trackingNote ?? '');
      setNextStatus('');
      setNote('');
      setSuccess('Order updated successfully');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (!order) return <Typography color="error">{error || 'Order not found'}</Typography>;

  const options = NEXT_STATUS[order.status] ?? [];
  const activeStep = Math.max(0, STATUS_STEPS.indexOf(order.status));
  const addr = order.deliveryAddress;
  const fullAddress = addr
    ? [addr.line1, addr.line2, addr.area, addr.city, addr.pincode].filter(Boolean).join(', ')
    : '';
  const mapsUrl =
    addr?.lat != null && addr?.lng != null
      ? `https://www.google.com/maps?q=${addr.lat},${addr.lng}`
      : addr
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
        : null;

  return (
    <Box>
      <Button sx={{ mb: 2 }} onClick={() => navigate('/shop/orders')}>
        ← Back to orders
      </Button>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      {success ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      ) : null}

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h6" fontWeight={800}>
                {order.orderNumber}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label={order.status} color="primary" />
                <Chip label={order.paymentStatus} variant="outlined" />
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Placed {new Date(order.createdAt).toLocaleString()}
              {order.deliveredAt ? ` · Delivered ${new Date(order.deliveredAt).toLocaleString()}` : ''}
            </Typography>

            <Stepper activeStep={activeStep} alternativeLabel sx={{ mt: 3, mb: 1 }}>
              {STATUS_STEPS.map((step) => (
                <Step key={step} completed={STATUS_STEPS.indexOf(step) <= activeStep && order.status !== 'cancelled'}>
                  <StepLabel>{step}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Order items
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {item.imageUrl ? (
                          <Box
                            component="img"
                            src={resolveUploadUrl(item.imageUrl)}
                            alt={item.name}
                            sx={{ width: 44, height: 44, borderRadius: 1, objectFit: 'cover' }}
                          />
                        ) : null}
                        {item.name}
                      </Box>
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>₹{item.price.toLocaleString('en-IN')}</TableCell>
                    <TableCell align="right">₹{item.lineTotal.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} align="right">
                    <strong>Grand total</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>₹{order.total.toLocaleString('en-IN')}</strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>

          {order.statusHistory.length > 0 ? (
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Status history
              </Typography>
              {order.statusHistory.map((entry, i) => (
                <Box key={`${entry.status}-${entry.at}-${i}`} sx={{ mb: 1.5 }}>
                  <Typography variant="body2" fontWeight={700}>
                    {entry.status} · {new Date(entry.at).toLocaleString()}
                  </Typography>
                  {entry.note ? (
                    <Typography variant="caption" color="text.secondary">
                      {entry.note}
                    </Typography>
                  ) : null}
                </Box>
              ))}
            </Box>
          ) : null}
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Cook details
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {order.cookName ?? '—'}
            </Typography>
            {order.cookPhone ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                <Phone fontSize="small" color="action" />
                <Typography variant="body2">+91 {order.cookPhone}</Typography>
                <Button size="small" onClick={() => copyText(`+91${order.cookPhone}`)}>
                  <ContentCopy fontSize="inherit" />
                </Button>
              </Box>
            ) : null}
            {order.cookEmail ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <Email fontSize="small" color="action" />
                <Typography variant="body2">{order.cookEmail}</Typography>
              </Box>
            ) : null}
            {order.notes ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                Cook note: {order.notes}
              </Typography>
            ) : null}
          </Box>

          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocationOn color="primary" />
              <Typography variant="subtitle1" fontWeight={700}>
                Delivery / pickup address
              </Typography>
            </Box>
            {addr ? (
              <>
                {addr.label ? (
                  <Chip size="small" label={addr.label} sx={{ mb: 1 }} />
                ) : null}
                <Typography variant="body2">{addr.line1}</Typography>
                {addr.line2 ? <Typography variant="body2">{addr.line2}</Typography> : null}
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {addr.area}, {addr.city}
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  PIN {addr.pincode}
                </Typography>
                {addr.lat != null && addr.lng != null ? (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    GPS: {addr.lat.toFixed(5)}, {addr.lng.toFixed(5)}
                  </Typography>
                ) : null}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ContentCopy />}
                    onClick={() => copyText(fullAddress)}
                  >
                    Copy address
                  </Button>
                  {mapsUrl ? (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<OpenInNew />}
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open in Maps
                    </Button>
                  ) : null}
                </Box>
              </>
            ) : (
              <Typography variant="body2" color="error">
                No delivery address on file — ask cook to update profile address.
              </Typography>
            )}
          </Box>

          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocalShipping color="primary" />
              <Typography variant="subtitle1" fontWeight={700}>
                Update delivery
              </Typography>
            </Box>

            <TextField
              label="Tracking / courier note"
              value={trackingNote}
              onChange={(e) => setTrackingNote(e.target.value)}
              size="small"
              fullWidth
              multiline
              minRows={2}
              placeholder="Courier name, AWB, rider phone..."
              sx={{ mb: 2 }}
            />

            {options.length > 0 ? (
              <>
                <TextField
                  select
                  label="New status"
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value)}
                  size="small"
                  fullWidth
                  SelectProps={{ native: true }}
                  sx={{ mb: 1.5 }}
                >
                  <option value="" />
                  {options.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </TextField>
                <TextField
                  label="Internal note (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  size="small"
                  fullWidth
                  sx={{ mb: 1.5 }}
                />
                <Button
                  variant="contained"
                  fullWidth
                  disabled={!nextStatus || saving}
                  onClick={handleUpdateStatus}
                >
                  Save & update status
                </Button>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Order is {order.status}. No further status changes.
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ShopOrderDetailPage;
