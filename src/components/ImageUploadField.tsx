import { useRef, useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { resolveUploadUrl } from '../utils/resolveUploadUrl';
import { fileToDataUri } from '../utils/fileToDataUri';

type ImageUploadFieldProps = {
  label: string;
  value?: string;
  onChange?: (url: string) => void;
  onUpload: (dataUri: string) => Promise<string>;
  onPreview?: (src: string, label: string) => void;
  disabled?: boolean;
  helperText?: string;
  previewHeight?: number;
};

const ImageUploadField = ({
  label,
  value,
  onChange,
  onUpload,
  onPreview,
  disabled = false,
  helperText,
  previewHeight = 140,
}: ImageUploadFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewSrc = resolveUploadUrl(value);

  const handleFile = async (file?: File | null) => {
    if (!file) {
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const dataUri = await fileToDataUri(file);
      const url = await onUpload(dataUri);
      onChange?.(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {label}
      </Typography>

      {previewSrc ? (
        <Box
          component="img"
          src={previewSrc}
          alt={label}
          onClick={() => onPreview?.(previewSrc, label)}
          sx={{
            width: '100%',
            height: previewHeight,
            objectFit: 'cover',
            borderRadius: 1,
            mb: 1,
            cursor: onPreview ? 'pointer' : 'default',
            backgroundColor: 'grey.100',
          }}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: previewHeight,
            borderRadius: 1,
            mb: 1,
            border: '1px dashed',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
            fontSize: 14,
          }}
        >
          No image selected
        </Box>
      )}

      {helperText ? (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          {helperText}
        </Typography>
      ) : null}

      {error ? (
        <Typography variant="caption" color="error" display="block" sx={{ mb: 1 }}>
          {error}
        </Typography>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <Button
        size="small"
        variant="outlined"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        startIcon={uploading ? <CircularProgress size={14} /> : undefined}
      >
        {uploading ? 'Uploading...' : previewSrc ? 'Change Image' : 'Pick Image'}
      </Button>
    </Box>
  );
};

export default ImageUploadField;
