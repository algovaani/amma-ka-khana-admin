import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { UserDetailResponse } from '../services/api/usersApi';
import { cooksApi } from '../services/api/cooksApi';
import ImageUploadField from './ImageUploadField';

type CookProfile = NonNullable<UserDetailResponse['cookProfile']>;

interface CookProfileEditorProps {
  userId: string;
  cookProfile: CookProfile;
  onUpdated: () => void;
  onPreview: (src: string, label: string) => void;
}

const CookProfileEditor = ({ userId, cookProfile, onUpdated, onPreview }: CookProfileEditorProps) => {
  const [form, setForm] = useState({
    displayName: cookProfile.displayName ?? '',
    email: cookProfile.email ?? '',
    area: cookProfile.area ?? '',
    address: cookProfile.address ?? '',
    aadharNumber: cookProfile.aadharNumber ?? '',
    fssaiNumber: cookProfile.fssaiNumber ?? '',
    fssaiBusinessName: cookProfile.fssaiBusinessName ?? '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      displayName: cookProfile.displayName ?? '',
      email: cookProfile.email ?? '',
      area: cookProfile.area ?? '',
      address: cookProfile.address ?? '',
      aadharNumber: cookProfile.aadharNumber ?? '',
      fssaiNumber: cookProfile.fssaiNumber ?? '',
      fssaiBusinessName: cookProfile.fssaiBusinessName ?? '',
    });
  }, [cookProfile]);

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const uploadCookImage = async (dataUri: string, type: string) => {
    const res = await cooksApi.uploadImage(userId, dataUri, type);
    onUpdated();
    return res.data.url;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await cooksApi.updateProfile(userId, form);
      onUpdated();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Edit Cook Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Display Name"
            value={form.displayName}
            onChange={(e) => setField('displayName', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Area"
            value={form.area}
            onChange={(e) => setField('area', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Aadhar Number"
            value={form.aadharNumber}
            onChange={(e) => setField('aadharNumber', e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address"
            value={form.address}
            onChange={(e) => setField('address', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="FSSAI Number"
            value={form.fssaiNumber}
            onChange={(e) => setField('fssaiNumber', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Business / Kitchen Name"
            value={form.fssaiBusinessName}
            onChange={(e) => setField('fssaiBusinessName', e.target.value)}
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 700 }}>
        Upload / Replace Images
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <ImageUploadField
            label="Profile Photo"
            value={cookProfile.profilePicUrl}
            onUpload={(dataUri) => uploadCookImage(dataUri, 'profile')}
            onPreview={onPreview}
            disabled={saving}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ImageUploadField
            label="Aadhar Front"
            value={cookProfile.aadharPhotoUrl}
            onUpload={(dataUri) => uploadCookImage(dataUri, 'aadhar')}
            onPreview={onPreview}
            disabled={saving}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ImageUploadField
            label="Aadhar Back"
            value={cookProfile.aadharBackPhotoUrl}
            onUpload={(dataUri) => uploadCookImage(dataUri, 'aadhar_back')}
            onPreview={onPreview}
            disabled={saving}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ImageUploadField
            label="FSSAI Certificate"
            value={cookProfile.fssaiCertificateUrl}
            onUpload={(dataUri) => uploadCookImage(dataUri, 'fssai')}
            onPreview={onPreview}
            disabled={saving}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ImageUploadField
            label="Kitchen Photo"
            onUpload={(dataUri) => uploadCookImage(dataUri, 'kitchen')}
            onPreview={onPreview}
            disabled={saving}
          />
        </Grid>
      </Grid>

      <Button
        variant="contained"
        sx={{ mt: 3 }}
        onClick={handleSave}
        disabled={saving}
        startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}
      >
        Save Cook Details
      </Button>
    </Box>
  );
};

export default CookProfileEditor;
