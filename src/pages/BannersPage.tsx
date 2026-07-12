import { useEffect, useMemo, useState } from 'react';
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
import {
  AdminBanner,
  BannerActionType,
  BannerAppTarget,
  BannerScreenTarget,
  bannersApi,
} from '../services/api/bannersApi';
import { categoriesApi, MenuCategoryItem } from '../services/api/categoriesApi';
import { uploadsApi } from '../services/api/uploadsApi';
import ImageUploadField from '../components/ImageUploadField';
import { resolveUploadUrl } from '../utils/resolveUploadUrl';

const formatLabel = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const CUSTOMER_SCREENS: BannerScreenTarget[] = ['all', 'home', 'orders', 'wallet', 'profile'];
const COOK_SCREENS: BannerScreenTarget[] = ['all', 'dashboard', 'menu', 'orders', 'earnings', 'profile'];
const ALL_SCREENS: BannerScreenTarget[] = [
  'all',
  'home',
  'orders',
  'wallet',
  'profile',
  'dashboard',
  'menu',
  'earnings',
];

const CUSTOMER_NAV_SCREENS = ['home', 'orders', 'wallet', 'profile'];
const COOK_NAV_SCREENS = ['dashboard', 'menu', 'orders', 'earnings', 'profile'];

const emptyForm = {
  title: '',
  subtitle: '',
  imageUrl: '',
  appTarget: 'customer' as BannerAppTarget,
  screenTarget: 'home' as BannerScreenTarget,
  actionType: 'none' as BannerActionType,
  actionValue: '',
  sortOrder: '',
  validFrom: '',
  validUntil: '',
};

const screenOptionsForApp = (appTarget: BannerAppTarget) => {
  if (appTarget === 'customer') return CUSTOMER_SCREENS;
  if (appTarget === 'cook') return COOK_SCREENS;
  return ALL_SCREENS;
};

const BannersPage = () => {
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [categories, setCategories] = useState<MenuCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBanner | null>(null);
  const [form, setForm] = useState(emptyForm);

  const screenOptions = useMemo(() => screenOptionsForApp(form.appTarget), [form.appTarget]);

  const navScreenOptions = useMemo(() => {
    if (form.appTarget === 'cook') return COOK_NAV_SCREENS;
    if (form.appTarget === 'customer') return CUSTOMER_NAV_SCREENS;
    return [...CUSTOMER_NAV_SCREENS, ...COOK_NAV_SCREENS];
  }, [form.appTarget]);

  const load = () => {
    setLoading(true);
    Promise.all([bannersApi.list(), categoriesApi.list()])
      .then(([bannerRes, categoryRes]) => {
        setBanners(bannerRes.data.banners);
        setCategories(categoryRes.data.categories);
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

  const openEdit = (banner: AdminBanner) => {
    setEditing(banner);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle ?? '',
      imageUrl: banner.imageUrl,
      appTarget: banner.appTarget,
      screenTarget: banner.screenTarget,
      actionType: banner.actionType,
      actionValue: banner.actionValue ?? '',
      sortOrder: String(banner.sortOrder),
      validFrom: banner.validFrom ? banner.validFrom.slice(0, 16) : '',
      validUntil: banner.validUntil ? banner.validUntil.slice(0, 16) : '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || undefined,
        imageUrl: form.imageUrl.trim(),
        appTarget: form.appTarget,
        screenTarget: form.screenTarget,
        actionType: form.actionType,
        actionValue:
          form.actionType === 'none' ? undefined : form.actionValue.trim() || undefined,
        sortOrder: form.sortOrder ? Number(form.sortOrder) : undefined,
        validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : undefined,
        validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : undefined,
      };

      if (editing) {
        await bannersApi.update(editing.id, payload);
      } else {
        await bannersApi.create(payload);
      }

      setDialogOpen(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const handleToggle = async (banner: AdminBanner) => {
    try {
      await bannersApi.toggle(banner.id, !banner.isActive);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Banners & Ads
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage promotional banners shown in customer and cook apps.
          </Typography>
        </Box>
        <Button variant="contained" onClick={openCreate}>
          Add Banner
        </Button>
      </Box>

      {error ? (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      ) : null}

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Preview</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>App</TableCell>
              <TableCell>Screen</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Sort</TableCell>
              <TableCell>Schedule</TableCell>
              <TableCell>Active</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9}>Loading...</TableCell>
              </TableRow>
            ) : banners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9}>No banners yet</TableCell>
              </TableRow>
            ) : (
              banners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <Box
                      component="img"
                      src={resolveUploadUrl(banner.imageUrl)}
                      alt={banner.title}
                      sx={{ width: 96, height: 48, objectFit: 'cover', borderRadius: 1 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>{banner.title}</Typography>
                    {banner.subtitle ? (
                      <Typography variant="caption" color="text.secondary">
                        {banner.subtitle}
                      </Typography>
                    ) : null}
                  </TableCell>
                  <TableCell>{formatLabel(banner.appTarget)}</TableCell>
                  <TableCell>{formatLabel(banner.screenTarget)}</TableCell>
                  <TableCell>
                    {banner.actionType === 'none'
                      ? '—'
                      : `${formatLabel(banner.actionType)}${banner.actionValue ? `: ${banner.actionValue}` : ''}`}
                  </TableCell>
                  <TableCell>{banner.sortOrder}</TableCell>
                  <TableCell>
                    {banner.validFrom || banner.validUntil ? (
                      <Typography variant="caption" display="block">
                        {banner.validFrom
                          ? new Date(banner.validFrom).toLocaleString('en-IN')
                          : 'Now'}
                        {' → '}
                        {banner.validUntil
                          ? new Date(banner.validUntil).toLocaleString('en-IN')
                          : 'Open'}
                      </Typography>
                    ) : (
                      'Always'
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={banner.isActive}
                      onChange={() => handleToggle(banner)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => openEdit(banner)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Banner' : 'Add Banner'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Title"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            required
            fullWidth
          />
          <TextField
            label="Subtitle (optional)"
            value={form.subtitle}
            onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
            fullWidth
          />
          <ImageUploadField
            label="Banner Image"
            value={form.imageUrl}
            onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
            onUpload={async (dataUri) => {
              const res = await uploadsApi.uploadImage(dataUri, 'banners');
              return res.data.url;
            }}
            helperText="Pick a wide image (recommended 16:9)"
            previewHeight={160}
          />

          <FormControl fullWidth>
            <InputLabel>App</InputLabel>
            <Select
              label="App"
              value={form.appTarget}
              onChange={(e) => {
                const appTarget = e.target.value as BannerAppTarget;
                const nextScreens = screenOptionsForApp(appTarget);
                setForm((prev) => ({
                  ...prev,
                  appTarget,
                  screenTarget: nextScreens.includes(prev.screenTarget)
                    ? prev.screenTarget
                    : nextScreens[1] ?? 'all',
                }));
              }}
            >
              <MenuItem value="customer">Customer App</MenuItem>
              <MenuItem value="cook">Cook App</MenuItem>
              <MenuItem value="both">Both Apps</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Screen / Page</InputLabel>
            <Select
              label="Screen / Page"
              value={form.screenTarget}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  screenTarget: e.target.value as BannerScreenTarget,
                }))
              }
            >
              {screenOptions.map((screen) => (
                <MenuItem key={screen} value={screen}>
                  {screen === 'all' ? 'All screens' : formatLabel(screen)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Action Type</InputLabel>
            <Select
              label="Action Type"
              value={form.actionType}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  actionType: e.target.value as BannerActionType,
                  actionValue: '',
                }))
              }
            >
              <MenuItem value="none">None (display only)</MenuItem>
              <MenuItem value="url">Open URL</MenuItem>
              <MenuItem value="screen">Go to app screen</MenuItem>
              <MenuItem value="category">Food category</MenuItem>
            </Select>
          </FormControl>

          {form.actionType === 'url' ? (
            <TextField
              label="URL"
              value={form.actionValue}
              onChange={(e) => setForm((prev) => ({ ...prev, actionValue: e.target.value }))}
              placeholder="https://..."
              fullWidth
            />
          ) : null}

          {form.actionType === 'screen' ? (
            <FormControl fullWidth>
              <InputLabel>Target Screen</InputLabel>
              <Select
                label="Target Screen"
                value={form.actionValue}
                onChange={(e) => setForm((prev) => ({ ...prev, actionValue: e.target.value }))}
              >
                {navScreenOptions.map((screen) => (
                  <MenuItem key={screen} value={screen}>
                    {formatLabel(screen)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}

          {form.actionType === 'category' ? (
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                value={form.actionValue}
                onChange={(e) => setForm((prev) => ({ ...prev, actionValue: e.target.value }))}
              >
                {categories
                  .filter((category) => category.isActive)
                  .map((category) => (
                    <MenuItem key={category.id} value={category.slug}>
                      {category.label}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          ) : null}

          <TextField
            label="Sort order"
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Valid from"
            type="datetime-local"
            value={form.validFrom}
            onChange={(e) => setForm((prev) => ({ ...prev, validFrom: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Valid until"
            type="datetime-local"
            value={form.validUntil}
            onChange={(e) => setForm((prev) => ({ ...prev, validUntil: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!form.title.trim() || !form.imageUrl.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BannersPage;
