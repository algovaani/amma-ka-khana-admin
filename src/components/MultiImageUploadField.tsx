import { useRef, useState } from 'react';
import { Box, Button, CircularProgress, IconButton, Typography } from '@mui/material';
import { Close, AddPhotoAlternate } from '@mui/icons-material';
import { resolveUploadUrl } from '../utils/resolveUploadUrl';
import { fileToDataUri } from '../utils/fileToDataUri';

type Props = {
  label: string;
  values: string[];
  onChange: (urls: string[]) => void;
  onUpload: (dataUri: string) => Promise<string>;
  max?: number;
};

const MultiImageUploadField = ({ label, values, onChange, onUpload, max = 8 }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePick = async (file: File | null) => {
    if (!file || values.length >= max) return;
    setUploading(true);
    setError(null);
    try {
      const dataUri = await fileToDataUri(file);
      const url = await onUpload(dataUri);
      onChange([...values, url]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeAt = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        {label}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
        Up to {max} images. First image is the cover.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        {values.map((url, index) => (
          <Box
            key={`${url}-${index}`}
            sx={{
              position: 'relative',
              width: 96,
              height: 96,
              borderRadius: 1.5,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box
              component="img"
              src={resolveUploadUrl(url)}
              alt={`Product ${index + 1}`}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {index === 0 ? (
              <Box
                sx={{
                  position: 'absolute',
                  left: 4,
                  bottom: 4,
                  bgcolor: 'primary.main',
                  color: '#fff',
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                Cover
              </Box>
            ) : null}
            <IconButton
              size="small"
              onClick={() => removeAt(index)}
              sx={{
                position: 'absolute',
                top: 2,
                right: 2,
                bgcolor: 'rgba(0,0,0,0.55)',
                color: '#fff',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        ))}

        {values.length < max ? (
          <Button
            variant="outlined"
            component="label"
            disabled={uploading}
            sx={{
              width: 96,
              height: 96,
              flexDirection: 'column',
              gap: 0.5,
              borderStyle: 'dashed',
            }}
          >
            {uploading ? (
              <CircularProgress size={22} />
            ) : (
              <>
                <AddPhotoAlternate />
                <Typography variant="caption">Add</Typography>
              </>
            )}
            <input
              ref={inputRef}
              hidden
              type="file"
              accept="image/*"
              onChange={(e) => handlePick(e.target.files?.[0] ?? null)}
            />
          </Button>
        ) : null}
      </Box>

      {error ? (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
          {error}
        </Typography>
      ) : null}
    </Box>
  );
};

export default MultiImageUploadField;
