import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { shopApi, ShopSettings } from '../../services/api/shopApi';

const ShopSettingsPage = () => {
  const [settings, setSettings] = useState<ShopSettings>({
    minShopOrderAmount: 500,
    shopEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    shopApi
      .getSettings()
      .then((res) => {
        setSettings(res.data);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await shopApi.updateSettings(settings);
      setSettings(res.data);
      setSuccess('Shop settings saved');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box>
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

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', maxWidth: 480 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Shop settings
          </Typography>
          <TextField
            label="Minimum shop order amount (₹)"
            type="number"
            value={settings.minShopOrderAmount}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, minShopOrderAmount: Number(e.target.value) }))
            }
            helperText="Cooks must reach this cart total before checkout (wallet payment)"
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.shopEnabled}
                onChange={(e) => setSettings((prev) => ({ ...prev, shopEnabled: e.target.checked }))}
              />
            }
            label="Shop enabled for cooks"
          />
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            Save settings
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ShopSettingsPage;
