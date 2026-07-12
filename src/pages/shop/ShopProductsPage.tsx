import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
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
import MultiImageUploadField from '../../components/MultiImageUploadField';
import { shopApi, ShopCategory, ShopProduct } from '../../services/api/shopApi';
import { uploadsApi } from '../../services/api/uploadsApi';
import { resolveUploadUrl } from '../../utils/resolveUploadUrl';

const ShopProductsPage = () => {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ShopProduct | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stock, setStock] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const loadCategories = () => {
    shopApi
      .listCategories()
      .then((res) => setCategories(res.data.categories.filter((c) => c.isActive)))
      .catch(() => setCategories([]));
  };

  const load = () => {
    setLoading(true);
    shopApi
      .listProducts(1, 100, undefined, filterCategoryId || undefined)
      .then((res) => {
        setProducts(res.data.products);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    load();
  }, [filterCategoryId]);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategoryId(categories[0]?.id ?? '');
    setStock('0');
    setSortOrder('0');
    setImages([]);
    setDialogOpen(true);
  };

  const openEdit = (product: ShopProduct) => {
    setEditing(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(String(product.price));
    setCategoryId(product.categoryId ?? '');
    setStock(String(product.stock));
    setSortOrder(String(product.sortOrder));
    setImages(product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : []);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!categoryId) {
      setError('Please select a category');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        categoryId,
        stock: Number(stock),
        sortOrder: Number(sortOrder) || 0,
        images,
        imageUrl: images[0] ?? '',
      };
      if (editing) {
        await shopApi.updateProduct(editing.id, payload);
      } else {
        await shopApi.createProduct(payload);
      }
      setDialogOpen(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (product: ShopProduct) => {
    try {
      await shopApi.toggleProduct(product.id, !product.isActive);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Toggle failed');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h6" fontWeight={700}>
          Shop products
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Filter category</InputLabel>
            <Select
              label="Filter category"
              value={filterCategoryId}
              onChange={(e) => setFilterCategoryId(e.target.value)}
            >
              <MenuItem value="">All categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={openCreate} disabled={categories.length === 0}>
            Add product
          </Button>
        </Box>
      </Box>

      {categories.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Add at least one active category before creating products.
        </Alert>
      ) : null}

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
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {(product.images?.length ? product.images[0] : product.imageUrl) ? (
                    <Box
                      component="img"
                      src={resolveUploadUrl(product.images?.[0] ?? product.imageUrl ?? '')}
                      alt={product.name}
                      sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 1 }}
                    />
                  ) : (
                    '—'
                  )}
                  {(product.images?.length ?? 0) > 1 ? (
                    <Typography variant="caption" display="block" color="text.secondary">
                      +{(product.images?.length ?? 0) - 1} more
                    </Typography>
                  ) : null}
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.categoryName || '—'}</TableCell>
                <TableCell>₹{product.price.toLocaleString('en-IN')}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Switch checked={product.isActive} onChange={() => handleToggle(product)} />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => openEdit(product)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit product' : 'Add product'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <FormControl fullWidth required>
            <InputLabel>Category</InputLabel>
            <Select label="Category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
          <TextField
            label="Price (₹)"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            fullWidth
          />
          <TextField
            label="Stock"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            fullWidth
          />
          <TextField
            label="Sort order"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            fullWidth
          />
          <MultiImageUploadField
            label="Product images"
            values={images}
            onChange={setImages}
            onUpload={async (dataUri) => {
              const res = await uploadsApi.uploadImage(dataUri, 'assets');
              return res.data.url;
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !name.trim() || !price || !categoryId}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShopProductsPage;
