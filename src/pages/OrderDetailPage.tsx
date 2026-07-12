import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ordersApi, AdminOrderDetail } from '../services/api/ordersApi';

const formatLabel = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const formatMoney = (value?: number) => `₹${(value ?? 0).toLocaleString('en-IN')}`;

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : '—';

const statusColor = (
  status: string
): 'default' | 'primary' | 'success' | 'warning' | 'error' => {
  if (status === 'pending') return 'warning';
  if (status === 'accepted' || status === 'cooking' || status === 'code_pending') return 'primary';
  if (status === 'ready' || status === 'picked' || status === 'completed') return 'success';
  if (status === 'cancelled' || status === 'rejected' || status === 'refunded') return 'error';
  return 'default';
};

const timelineSteps: Array<{ key: keyof AdminOrderDetail['timeline']; label: string }> = [
  { key: 'createdAt', label: 'Placed' },
  { key: 'acceptedAt', label: 'Accepted' },
  { key: 'cookingStartedAt', label: 'Cooking' },
  { key: 'readyAt', label: 'Ready' },
  { key: 'pickedAt', label: 'Picked up' },
  { key: 'codePendingAt', label: 'Code pending' },
  { key: 'codeVerifiedAt', label: 'Code verified' },
  { key: 'completedAt', label: 'Completed' },
  { key: 'cancelledAt', label: 'Cancelled' },
];

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!orderId) return;
    setLoading(true);
    ordersApi
      .getDetail(orderId)
      .then((res) => {
        setOrder(res.data);
        setError(null);
      })
      .catch((err: Error) => {
        setOrder(null);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [orderId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/orders')} sx={{ mb: 2 }}>
          Back to Orders
        </Button>
        <Typography color="error">{error || 'Order not found'}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/orders')} sx={{ mb: 2 }}>
        Back to Orders
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Order {order.orderNumber}
          </Typography>
          <Typography color="text.secondary">
            Placed on {formatDate(order.timeline.createdAt)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={formatLabel(order.status)} color={statusColor(order.status)} />
          <Chip label={formatLabel(order.paymentStatus)} variant="outlined" />
          <Chip label={formatLabel(order.paymentMethod)} variant="outlined" />
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Customer</Typography>
              <Typography><strong>Name:</strong> {order.customer.name}</Typography>
              <Typography><strong>Phone:</strong> {order.customer.phone}</Typography>
              <Typography><strong>Email:</strong> {order.customer.email}</Typography>
              <Button size="small" sx={{ mt: 1 }} onClick={() => navigate(`/users/${order.customer.id}`)}>
                View customer
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Cook</Typography>
              <Typography><strong>Name:</strong> {order.cook.name}</Typography>
              <Typography><strong>Phone:</strong> {order.cook.phone}</Typography>
              <Typography><strong>Email:</strong> {order.cook.email}</Typography>
              <Button size="small" sx={{ mt: 1 }} onClick={() => navigate(`/cooks/${order.cook.id}`)}>
                View cook
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Items</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Line total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item, index) => (
                    <TableRow key={`${item.menuItemId}-${index}`}>
                      <TableCell>
                        {item.name}
                        {item.mealSlot ? (
                          <Typography variant="caption" display="block" color="primary">
                            {item.mealSlot} package
                          </Typography>
                        ) : null}
                        {item.packageSelections?.map((component) =>
                          component.selections.map((entry) => (
                            <Typography
                              key={`${component.componentKey}-${entry.subtypeKey}`}
                              variant="caption"
                              display="block"
                              color="text.secondary"
                            >
                              {component.componentLabel}:{' '}
                              {`${entry.subtypeLabel} × ${entry.quantity}`}
                              {entry.lineTotal != null ? ` — ${formatMoney(entry.lineTotal)}` : ''}
                            </Typography>
                          ))
                        )}
                        {item.selectedExtras?.length ? (
                          <Typography variant="caption" display="block" color="text.secondary">
                            Selected extras:{' '}
                            {item.selectedExtras
                              .map((extra) => `${extra.label} (${formatMoney(extra.price)})`)
                              .join(', ')}
                          </Typography>
                        ) : null}
                        {item.extrasTotal != null && item.extrasTotal > 0 ? (
                          <Typography variant="caption" display="block" color="text.secondary">
                            Extras total: {formatMoney(item.extrasTotal)}
                          </Typography>
                        ) : null}
                        {item.specialInstructions ? (
                          <Typography variant="caption" display="block" color="text.secondary">
                            Note: {item.specialInstructions}
                          </Typography>
                        ) : null}
                      </TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{formatMoney(item.price)}</TableCell>
                      <TableCell align="right">{formatMoney(item.price * item.quantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Bill details</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Package charge</Typography>
                <Typography>{formatMoney(order.subtotal)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>GST (5%)</Typography>
                <Typography>{formatMoney(order.tax)}</Typography>
              </Box>
              {order.discount > 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>
                    Coupon{order.couponCode ? ` (${order.couponCode})` : ''}
                    {order.couponApplyOn ? ` · ${formatLabel(order.couponApplyOn)}` : ''}
                  </Typography>
                  <Typography>-{formatMoney(order.discount)}</Typography>
                </Box>
              ) : null}
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography fontWeight={700}>Total</Typography>
                <Typography fontWeight={700}>{formatMoney(order.total)}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Self pickup only. Paid via {formatLabel(order.paymentMethod)}.
              </Typography>
              {order.paymentId ? (
                <Typography variant="body2" color="text.secondary">
                  Payment ref: {order.paymentId}
                </Typography>
              ) : null}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Pickup</Typography>
              <Typography><strong>Type:</strong> Self pickup</Typography>
              <Typography>
                <strong>Location:</strong>{' '}
                {order.pickupAddress?.displayName || order.cook.name}
              </Typography>
              <Typography>
                <strong>Address:</strong>{' '}
                {[order.pickupAddress?.line1, order.pickupAddress?.area, order.pickupAddress?.city]
                  .filter(Boolean)
                  .join(', ') || '—'}
              </Typography>
              {order.pickupVerificationCode ? (
                <Typography sx={{ mt: 1 }}>
                  <strong>Verification code:</strong> {order.pickupVerificationCode}
                </Typography>
              ) : null}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Timeline</Typography>
              {timelineSteps.map((step) => {
                const value = order.timeline[step.key];
                if (!value) return null;
                return (
                  <Box key={step.key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>{step.label}</Typography>
                    <Typography color="text.secondary">{formatDate(value)}</Typography>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {order.notes || order.cancelReason ? (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Notes</Typography>
                {order.notes ? <Typography sx={{ mb: 1 }}>{order.notes}</Typography> : null}
                {order.cancelReason ? (
                  <Typography color="error.main">
                    <strong>Cancel reason:</strong> {order.cancelReason}
                  </Typography>
                ) : null}
              </CardContent>
            </Card>
          </Grid>
        ) : null}
      </Grid>
    </Box>
  );
};

export default OrderDetailPage;
