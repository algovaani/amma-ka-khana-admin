import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { shopApi, ShopCategory } from '../../services/api/shopApi';

const ShopCategoriesPage = () => {
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ShopCategory | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    shopApi
      .listCategories()
      .then((res) => {
        setCategories(res.data.categories);
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
    setName('');
    setSlug('');
    setDescription('');
    setSortOrder('0');
    setDialogOpen(true);
  };

  const openEdit = (category: ShopCategory) => {
    setEditing(category);
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description);
    setSortOrder(String(category.sortOrder));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim(),
        sortOrder: Number(sortOrder) || 0,
      };
      if (editing) {
        await shopApi.updateCategory(editing.id, payload);
      } else {
        await shopApi.createCategory(payload);
      }
      setDialogOpen(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (category: ShopCategory) => {
    try {
      await shopApi.toggleCategory(category.id, !category.isActive);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Toggle failed');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Shop categories
        </Typography>
        <Button variant="contained" onClick={openCreate}>
          Add category
        </Button>
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
              <TableCell>Name</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Sort</TableCell>
              <TableCell>Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell>{category.sortOrder}</TableCell>
                <TableCell>
                  <Switch checked={category.isActive} onChange={() => handleToggle(category)} />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => openEdit(category)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit category' : 'Add category'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <TextField
            label="Slug (optional)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            fullWidth
            helperText="Auto-generated from name if empty"
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
          <TextField
            label="Sort order"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !name.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShopCategoriesPage;
