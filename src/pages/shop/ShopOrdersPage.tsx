import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { shopApi, ShopOrder } from '../../services/api/shopApi';

const statusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'confirmed':
    case 'processing':
      return 'info';
    case 'shipped':
      return 'primary';
    case 'delivered':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const ShopOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const load = () => {
    setLoading(true);
    shopApi
      .listOrders(1, 50, status || undefined)
      .then((res) => {
        setOrders(res.data.orders);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [status]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Shop orders
        </Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="shipped">Shipped</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Cook</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Delivery</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/shop/orders/${order.id}`)}
              >
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>
                  {order.cookName ?? '—'}
                  {order.cookPhone ? ` · ${order.cookPhone}` : ''}
                </TableCell>
                <TableCell>{order.items.length}</TableCell>
                <TableCell>₹{order.total.toLocaleString('en-IN')}</TableCell>
                <TableCell>
                  {order.deliveryAddress
                    ? `${order.deliveryAddress.area}, ${order.deliveryAddress.city}`
                    : '—'}
                </TableCell>
                <TableCell>
                  <Chip size="small" label={order.status} color={statusColor(order.status) as any} />
                </TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default ShopOrdersPage;
