import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import {
  mealPackageApi,
  MealPackageComponent,
  MealPackageTab,
} from '../services/api/mealPackageApi';

const emptyComponent = (): MealPackageComponent => ({
  key: '',
  label: '',
  required: false,
  fixedQuantity: null,
  allowMultiple: false,
  minSelections: 0,
  maxSelections: 1,
  subtypes: [{ key: '', label: '', price: 0 }],
});

const MealPackagePage = () => {
  const [tabs, setTabs] = useState<MealPackageTab[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    mealPackageApi
      .getConfig()
      .then((res) => {
        setTabs(res.data.tabs);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const currentTab = tabs[activeTab];

  const updateCurrentTab = (patch: Partial<MealPackageTab>) => {
    setTabs((prev) =>
      prev.map((tab, index) => (index === activeTab ? { ...tab, ...patch } : tab))
    );
  };

  const updateComponent = (componentIndex: number, patch: Partial<MealPackageComponent>) => {
    if (!currentTab) return;
    const components = currentTab.components.map((component, index) =>
      index === componentIndex ? { ...component, ...patch } : component
    );
    updateCurrentTab({ components });
  };

  const addComponent = () => {
    if (!currentTab) return;
    updateCurrentTab({ components: [...currentTab.components, emptyComponent()] });
  };

  const removeComponent = (componentIndex: number) => {
    if (!currentTab) return;
    updateCurrentTab({
      components: currentTab.components.filter((_, index) => index !== componentIndex),
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(null);
    try {
      const res = await mealPackageApi.updateConfig(tabs);
      setTabs(res.data.tabs);
      setSuccess('Meal package configuration saved.');
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const tabLabels = useMemo(
    () => tabs.map((tab) => `${tab.label} (${tab.mealSlot})`),
    [tabs]
  );

  if (loading) {
    return <Typography>Loading meal package config...</Typography>;
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Meal Package Config
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure Lunch / Dinner tabs, optional items, subtypes, prices and fixed limits.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
          Save
        </Button>
      </Stack>

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

      <Paper sx={{ p: 2 }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} sx={{ mb: 2 }}>
          {tabLabels.map((label) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>

        {currentTab ? (
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Tab label"
                value={currentTab.label}
                onChange={(e) => updateCurrentTab({ label: e.target.value })}
                fullWidth
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={currentTab.isActive}
                    onChange={(e) => updateCurrentTab({ isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Stack>

            <Divider />

            <Typography variant="h6" fontWeight={700}>
              Package pricing
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Subji, service charge aur GST — customer ko total amount isi se banta hai.
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Subji price (₹)"
                type="number"
                value={currentTab.subjiPrice ?? 0}
                onChange={(e) =>
                  updateCurrentTab({ subjiPrice: Math.max(0, Number(e.target.value) || 0) })
                }
                fullWidth
                inputProps={{ min: 0, step: 1 }}
              />
              <TextField
                label="Service charge (₹)"
                type="number"
                value={currentTab.serviceChargeAmount ?? 0}
                onChange={(e) =>
                  updateCurrentTab({
                    serviceChargeAmount: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                fullWidth
                helperText="Amount only — percentage customer ko nahi dikhega"
                inputProps={{ min: 0, step: 1 }}
              />
              <TextField
                label="GST (%)"
                type="number"
                value={currentTab.gstPercent ?? 5}
                onChange={(e) =>
                  updateCurrentTab({
                    gstPercent: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                  })
                }
                fullWidth
                inputProps={{ min: 0, max: 100, step: 0.5 }}
              />
            </Stack>

            <Divider />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Components</Typography>
              <Button startIcon={<AddIcon />} onClick={addComponent}>
                Add component
              </Button>
            </Stack>

            {currentTab.components.map((component, componentIndex) => (
              <Paper key={componentIndex} variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography fontWeight={700}>
                      {component.label || `Component ${componentIndex + 1}`}
                    </Typography>
                    <IconButton color="error" onClick={() => removeComponent(componentIndex)}>
                      <DeleteIcon />
                    </IconButton>
                  </Stack>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                    <TextField
                      label="Label (e.g. Roti)"
                      value={component.label}
                      onChange={(e) => updateComponent(componentIndex, { label: e.target.value })}
                      fullWidth
                    />
                    <TextField
                      label="Fixed quantity (optional)"
                      type="number"
                      value={component.fixedQuantity ?? ''}
                      onChange={(e) =>
                        updateComponent(componentIndex, {
                          fixedQuantity: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      fullWidth
                    />
                    <TextField
                      label="Max selections"
                      type="number"
                      value={component.maxSelections}
                      onChange={(e) =>
                        updateComponent(componentIndex, {
                          maxSelections: Number(e.target.value) || 1,
                        })
                      }
                      fullWidth
                    />
                  </Stack>

                  <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={component.allowMultiple ?? component.maxSelections > 1}
                          onChange={(e) =>
                            updateComponent(componentIndex, {
                              allowMultiple: e.target.checked,
                              maxSelections: e.target.checked
                                ? Math.max(component.maxSelections, 2)
                                : 1,
                            })
                          }
                        />
                      }
                      label="Allow multiple selection"
                    />
                    {component.allowMultiple ?? component.maxSelections > 1 ? (
                      <Chip size="small" color="success" label="Multi-select enabled" />
                    ) : (
                      <Chip size="small" label="Single select only" />
                    )}
                  </Stack>

                  {component.fixedQuantity ? (
                    <Chip size="small" color="primary" label={`Fixed quantity: ${component.fixedQuantity}`} />
                  ) : null}

                  <Typography variant="subtitle2">Subtypes</Typography>
                  {component.subtypes.map((subtype, subtypeIndex) => (
                    <Stack key={subtypeIndex} direction="row" spacing={1}>
                      <TextField
                        label="Subtype label"
                        value={subtype.label}
                        onChange={(e) => {
                          const subtypes = component.subtypes.map((entry, index) =>
                            index === subtypeIndex ? { ...entry, label: e.target.value } : entry
                          );
                          updateComponent(componentIndex, { subtypes });
                        }}
                        fullWidth
                      />
                      <TextField
                        label="Price (₹)"
                        type="number"
                        value={subtype.price ?? 0}
                        onChange={(e) => {
                          const subtypes = component.subtypes.map((entry, index) =>
                            index === subtypeIndex
                              ? { ...entry, price: Math.max(0, Number(e.target.value) || 0) }
                              : entry
                          );
                          updateComponent(componentIndex, { subtypes });
                        }}
                        sx={{ minWidth: 120 }}
                        inputProps={{ min: 0, step: 1 }}
                      />
                      <IconButton
                        color="error"
                        onClick={() => {
                          const subtypes = component.subtypes.filter((_, index) => index !== subtypeIndex);
                          updateComponent(componentIndex, {
                            subtypes: subtypes.length ? subtypes : [{ key: '', label: '', price: 0 }],
                          });
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  ))}
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      updateComponent(componentIndex, {
                        subtypes: [...component.subtypes, { key: '', label: '', price: 0 }],
                      })
                    }
                  >
                    Add subtype
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        ) : null}
      </Paper>
    </Box>
  );
};

export default MealPackagePage;
