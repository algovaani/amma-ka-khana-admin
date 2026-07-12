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
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { locationsApi, LocationItem } from '../services/api/locationsApi';

const LocationsPage = () => {
  const [tab, setTab] = useState(0);
  const [countries, setCountries] = useState<LocationItem[]>([]);
  const [states, setStates] = useState<LocationItem[]>([]);
  const [cities, setCities] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [countryName, setCountryName] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [stateName, setStateName] = useState('');
  const [stateCountryId, setStateCountryId] = useState('');
  const [cityName, setCityName] = useState('');
  const [cityStateId, setCityStateId] = useState('');

  const load = () => {
    setLoading(true);
    locationsApi
      .getAll()
      .then((res) => {
        setCountries(res.data.countries);
        setStates(res.data.states);
        setCities(res.data.cities);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = async (type: 'country' | 'state' | 'city', id: string, isActive: boolean) => {
    try {
      if (type === 'country') await locationsApi.toggleCountry(id, isActive);
      if (type === 'state') await locationsApi.toggleState(id, isActive);
      if (type === 'city') await locationsApi.toggleCity(id, isActive);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const handleAdd = async () => {
    try {
      if (tab === 0) {
        await locationsApi.createCountry({ name: countryName, code: countryCode.toUpperCase() });
      } else if (tab === 1) {
        await locationsApi.createState({ name: stateName, countryId: stateCountryId });
      } else {
        await locationsApi.createCity({ name: cityName, stateId: cityStateId });
      }
      setDialogOpen(false);
      setCountryName('');
      setCountryCode('');
      setStateName('');
      setCityName('');
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Create failed');
    }
  };

  const getCountryName = (item: LocationItem) => {
    if (typeof item.countryId === 'object' && item.countryId?.name) {
      return item.countryId.name;
    }
    const c = countries.find((x) => x._id === item.countryId);
    return c?.name ?? '—';
  };

  const getStateName = (item: LocationItem) => {
    if (typeof item.stateId === 'object' && item.stateId?.name) {
      return item.stateId.name;
    }
    const s = states.find((x) => x._id === item.stateId);
    return s?.name ?? '—';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Working Locations
        </Typography>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>
          Add {tab === 0 ? 'Country' : tab === 1 ? 'State' : 'City'}
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Manage country, state and city for cook app. Only <strong>active</strong> locations appear in
        the app dropdown.
      </Typography>

      {error ? (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      ) : null}

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={`Countries (${countries.length})`} />
          <Tab label={`States (${states.length})`} />
          <Tab label={`Cities (${cities.length})`} />
        </Tabs>
      </Paper>

      <Paper>
        {loading ? (
          <Typography sx={{ p: 3 }}>Loading...</Typography>
        ) : tab === 0 ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell align="center">Active</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {countries.map((c) => (
                <TableRow key={c._id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.code}</TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={c.isActive}
                      onChange={(e) => handleToggle('country', c._id, e.target.checked)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : tab === 1 ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>State</TableCell>
                <TableCell>Country</TableCell>
                <TableCell align="center">Active</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {states.map((s) => (
                <TableRow key={s._id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{getCountryName(s)}</TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={s.isActive}
                      onChange={(e) => handleToggle('state', s._id, e.target.checked)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>City</TableCell>
                <TableCell>State</TableCell>
                <TableCell>Country</TableCell>
                <TableCell align="center">Active</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cities.map((c) => (
                <TableRow key={c._id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{getStateName(c)}</TableCell>
                  <TableCell>{getCountryName(c)}</TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={c.isActive}
                      onChange={(e) => handleToggle('city', c._id, e.target.checked)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          Add {tab === 0 ? 'Country' : tab === 1 ? 'State' : 'City'}
        </DialogTitle>
        <DialogContent>
          {tab === 0 ? (
            <>
              <TextField
                fullWidth
                label="Country Name"
                value={countryName}
                onChange={(e) => setCountryName(e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Country Code (e.g. IN)"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                margin="normal"
                inputProps={{ maxLength: 2 }}
              />
            </>
          ) : tab === 1 ? (
            <>
              <FormControl fullWidth margin="normal">
                <InputLabel>Country</InputLabel>
                <Select
                  value={stateCountryId}
                  label="Country"
                  onChange={(e) => setStateCountryId(e.target.value)}
                >
                  {countries.map((c) => (
                    <MenuItem key={c._id} value={c._id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="State Name"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                margin="normal"
              />
            </>
          ) : (
            <>
              <FormControl fullWidth margin="normal">
                <InputLabel>State</InputLabel>
                <Select
                  value={cityStateId}
                  label="State"
                  onChange={(e) => setCityStateId(e.target.value)}
                >
                  {states.map((s) => (
                    <MenuItem key={s._id} value={s._id}>
                      {s.name} ({getCountryName(s)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="City Name"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                margin="normal"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LocationsPage;
