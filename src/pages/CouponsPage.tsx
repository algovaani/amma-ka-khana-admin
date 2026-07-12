import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { couponsApi, AdminCoupon } from '../services/api/couponsApi';

const formatLabel = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const emptyForm = {
  code: '',
  title: '',
  description: '',
  applyOn: 'package',
  discountType: 'flat',
  discountValue: '',
  minOrderAmount: '',
  maxDiscount: '',
  usageLimit: '',
  perUserLimit: '1',
  validFrom: '',
  validUntil: '',
};

const CouponsPage = () => {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCoupon | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    setLoading(true);
    couponsApi
      .list()
      .then((res) => {
        setCoupons(res.data.coupons);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (coupon: AdminCoupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      title: coupon.title,
      description: coupon.description ?? '',
      applyOn: coupon.applyOn,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minOrderAmount: coupon.minOrderAmount != null ? String(coupon.minOrderAmount) : '',
      maxDiscount: coupon.maxDiscount != null ? String(coupon.maxDiscount) : '',
      usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : '',
      perUserLimit: String(coupon.perUserLimit ?? 1),
      validFrom: coupon.validFrom ? coupon.validFrom.slice(0, 16) : '',
      validUntil: coupon.validUntil ? coupon.validUntil.slice(0, 16) : '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        applyOn: form.applyOn,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : undefined,
        validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : undefined,
        validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : undefined,
      };

      if (editing) {
        await couponsApi.update(editing.id, payload);
      } else {
        await couponsApi.create({
          ...payload,
          code: form.code.trim().toUpperCase(),
        });
      }

      setDialogOpen(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const handleToggle = async (coupon: AdminCoupon) => {
    try {
      await couponsApi.toggle(coupon.id, !coupon.isActive);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Coupons
        </Typography>
        <Button variant="contained" onClick={openCreate}>
          Add Coupon
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Create coupon codes for package charge, platform charge, or delivery. Discount can be flat
        (₹) or percentage (%).
      </Typography>

      {error ? <Typography color="error" sx={{ mb: 2 }}>{error}</Typography> : null}

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Apply On</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Usage</TableCell>
              <TableCell>Valid</TableCell>
              <TableCell>Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell>{coupon.code}</TableCell>
                <TableCell>{coupon.title}</TableCell>
                <TableCell>{formatLabel(coupon.applyOn)}</TableCell>
                <TableCell>
                  {coupon.discountType === 'flat'
                    ? `₹${coupon.discountValue}`
                    : `${coupon.discountValue}%`}
                </TableCell>
                <TableCell>
                  {coupon.usedCount}
                  {coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : ''}
                </TableCell>
                <TableCell>
                  {coupon.validFrom || coupon.validUntil
                    ? `${coupon.validFrom ? new Date(coupon.validFrom).toLocaleDateString() : '—'} - ${
                        coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : '—'
                      }`
                    : 'Always'}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={coupon.isActive}
                    onChange={() => handleToggle(coupon)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => openEdit(coupon)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>No coupons found</TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit Coupon' : 'Add Coupon'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {!editing ? (
            <TextField
              label="Coupon code"
              value={form.code}
              onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
              placeholder="SAVE50"
              fullWidth
            />
          ) : (
            <TextField label="Coupon code" value={form.code} fullWidth disabled />
          )}
          <TextField
            label="Title"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            multiline
            rows={2}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Apply on</InputLabel>
            <Select
              label="Apply on"
              value={form.applyOn}
              onChange={(e) => setForm((prev) => ({ ...prev, applyOn: e.target.value }))}
            >
              <MenuItem value="package">On Package</MenuItem>
              <MenuItem value="platform_charge">On Platform Charge</MenuItem>
              <MenuItem value="delivery">On Delivery</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Discount type</InputLabel>
            <Select
              label="Discount type"
              value={form.discountType}
              onChange={(e) => setForm((prev) => ({ ...prev, discountType: e.target.value }))}
            >
              <MenuItem value="flat">Flat (₹)</MenuItem>
              <MenuItem value="percentage">Percentage (%)</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label={form.discountType === 'flat' ? 'Discount amount (₹)' : 'Discount percent (%)'}
            value={form.discountValue}
            onChange={(e) => setForm((prev) => ({ ...prev, discountValue: e.target.value }))}
            type="number"
            fullWidth
          />
          <TextField
            label="Minimum order amount (₹)"
            value={form.minOrderAmount}
            onChange={(e) => setForm((prev) => ({ ...prev, minOrderAmount: e.target.value }))}
            type="number"
            fullWidth
          />
          {form.discountType === 'percentage' ? (
            <TextField
              label="Max discount cap (₹)"
              value={form.maxDiscount}
              onChange={(e) => setForm((prev) => ({ ...prev, maxDiscount: e.target.value }))}
              type="number"
              fullWidth
            />
          ) : null}
          <TextField
            label="Total usage limit"
            value={form.usageLimit}
            onChange={(e) => setForm((prev) => ({ ...prev, usageLimit: e.target.value }))}
            type="number"
            fullWidth
          />
          <TextField
            label="Per user limit"
            value={form.perUserLimit}
            onChange={(e) => setForm((prev) => ({ ...prev, perUserLimit: e.target.value }))}
            type="number"
            fullWidth
          />
          <TextField
            label="Valid from"
            type="datetime-local"
            value={form.validFrom}
            onChange={(e) => setForm((prev) => ({ ...prev, validFrom: e.target.value }))}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Valid until"
            type="datetime-local"
            value={form.validUntil}
            onChange={(e) => setForm((prev) => ({ ...prev, validUntil: e.target.value }))}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!form.title.trim() || !form.discountValue || (!editing && !form.code.trim())}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CouponsPage;
