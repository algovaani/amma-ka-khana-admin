import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { categoriesApi, MenuCategoryItem } from '../services/api/categoriesApi';

const CategoriesPage = () => {
  const [categories, setCategories] = useState<MenuCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MenuCategoryItem | null>(null);
  const [label, setLabel] = useState('');
  const [slug, setSlug] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  const load = () => {
    setLoading(true);
    categoriesApi
      .list()
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
    setLabel('');
    setSlug('');
    setSortOrder('');
    setDialogOpen(true);
  };

  const openEdit = (category: MenuCategoryItem) => {
    setEditing(category);
    setLabel(category.label);
    setSlug(category.slug);
    setSortOrder(String(category.sortOrder));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await categoriesApi.update(editing.id, {
          label: label.trim(),
          sortOrder: sortOrder ? Number(sortOrder) : undefined,
        });
      } else {
        await categoriesApi.create({
          label: label.trim(),
          slug: slug.trim() || undefined,
          sortOrder: sortOrder ? Number(sortOrder) : undefined,
        });
      }
      setDialogOpen(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const handleToggle = async (category: MenuCategoryItem) => {
    try {
      await categoriesApi.toggle(category.id, !category.isActive);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Menu Categories
        </Typography>
        <Button variant="contained" onClick={openCreate}>
          Add Category
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Manage food categories for the cook and customer apps. Only <strong>active</strong>{' '}
        categories appear when cooks add menu items.
      </Typography>

      {error ? <Typography color="error" sx={{ mb: 2 }}>{error}</Typography> : null}

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Sort</TableCell>
              <TableCell>Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.label}</TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell>{category.sortOrder}</TableCell>
                <TableCell>
                  <Switch
                    checked={category.isActive}
                    onChange={() => handleToggle(category)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => openEdit(category)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>No categories found</TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Veg"
            fullWidth
          />
          {!editing ? (
            <TextField
              label="Slug (optional)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Auto-generated from label"
              fullWidth
            />
          ) : (
            <TextField label="Slug" value={slug} fullWidth disabled />
          )}
          <TextField
            label="Sort order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            type="number"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!label.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesPage;
