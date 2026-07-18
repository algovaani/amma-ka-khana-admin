import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  GlobalStyles,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { cooksApi, CookMapItem } from '../services/api/cooksApi';
import { resolveUploadUrl } from '../utils/resolveUploadUrl';

const defaultCenter: [number, number] = [26.9124, 75.7873];
const MAP_HEIGHT = 520;

// Leaflet default marker assets break under Vite unless paths are set explicitly.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const MARKER_SIZE = 56;
const MARKER_TIP = 12;
const MARKER_TOTAL_HEIGHT = MARKER_SIZE + MARKER_TIP;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const isCookOffline = (cook: CookMapItem) => cook.availability !== 'available';

const createCookMarkerIcon = (cook: CookMapItem) => {
  const imageUrl = resolveUploadUrl(cook.profilePicUrl);
  const offline = isCookOffline(cook);
  if (!imageUrl) {
    return undefined;
  }

  const safeName = escapeHtml(cook.name);
  const safeUrl = encodeURI(imageUrl).replace(/'/g, '%27');
  const borderColor = offline ? '#9e9e9e' : '#2e7d32';
  const offlineStyles = offline
    ? 'filter:blur(3px) grayscale(0.35);opacity:0.72;'
    : '';

  return L.divIcon({
    className: `cook-map-marker${offline ? ' cook-map-marker-offline' : ''}`,
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;width:${MARKER_SIZE}px;height:${MARKER_TOTAL_HEIGHT}px;overflow:visible;${offline ? 'opacity:0.85;' : ''}">
        <div
          title="${safeName}${offline ? ' (offline)' : ''}"
          style="
            width:${MARKER_SIZE}px;
            height:${MARKER_SIZE}px;
            border-radius:50%;
            border:3px solid ${borderColor};
            box-sizing:border-box;
            background:#e8f5e9 url('${safeUrl}') center center / cover no-repeat;
            box-shadow:0 2px 10px rgba(0,0,0,0.28);
            flex-shrink:0;
            ${offlineStyles}
          "
        ></div>
        <div style="
          width:0;
          height:0;
          border-left:8px solid transparent;
          border-right:8px solid transparent;
          border-top:${MARKER_TIP}px solid ${borderColor};
          margin-top:-1px;
          flex-shrink:0;
        "></div>
      </div>
    `,
    iconSize: [MARKER_SIZE, MARKER_TOTAL_HEIGHT],
    iconAnchor: [MARKER_SIZE / 2, MARKER_TOTAL_HEIGHT],
    popupAnchor: [0, -MARKER_TOTAL_HEIGHT],
  });
};

const MenuThumb = ({ src, alt }: { src?: string | null; alt: string }) => {
  const [failed, setFailed] = useState(false);
  const resolved = resolveUploadUrl(src);

  if (!resolved || failed) {
    return (
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 1,
          bgcolor: 'grey.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          flexShrink: 0,
        }}
      >
        🍽️
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={resolved}
      alt={alt}
      onError={() => setFailed(true)}
      sx={{ width: 56, height: 56, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }}
    />
  );
};

const formatLabel = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const formatReadyAt = (iso?: string | null) => {
  if (!iso) {
    return '—';
  }
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

const availabilityColor = (value: string): 'success' | 'warning' | 'default' | 'error' => {
  if (value === 'available') {
    return 'success';
  }
  if (value === 'busy') {
    return 'warning';
  }
  if (value === 'offline') {
    return 'default';
  }
  if (value === 'vacation') {
    return 'error';
  }
  return 'default';
};

const CookMarkerCluster = ({
  cooks,
  onCookSelect,
}: {
  cooks: CookMapItem[];
  onCookSelect: (cook: CookMapItem) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 56,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 17,
      animate: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        const size = count > 25 ? 52 : count > 10 ? 46 : 40;
        const fontSize = count > 25 ? 15 : count > 10 ? 14 : 13;

        return L.divIcon({
          html: `<div class="cook-cluster-bubble" style="width:${size}px;height:${size}px;font-size:${fontSize}px;"><span>${count}</span></div>`,
          className: 'cook-cluster-marker',
          iconSize: L.point(size, size),
        });
      },
    });

    cooks.forEach((cook) => {
      const icon = createCookMarkerIcon(cook);
      const marker = L.marker([cook.lat, cook.lng], icon ? { icon } : undefined);
      marker.on('mouseover', () => onCookSelect(cook));
      marker.on('click', () => onCookSelect(cook));
      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);

    return () => {
      map.removeLayer(clusterGroup);
      clusterGroup.clearLayers();
    };
  }, [cooks, map, onCookSelect]);

  return null;
};

const FitCookBounds = ({ cooks }: { cooks: CookMapItem[] }) => {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
      if (cooks.length === 0) {
        map.setView(defaultCenter, 11);
        return;
      }
      if (cooks.length === 1) {
        map.setView([cooks[0].lat, cooks[0].lng], 14);
        return;
      }
      const bounds = L.latLngBounds(cooks.map((cook) => [cook.lat, cook.lng]));
      map.fitBounds(bounds, { padding: [48, 48] });
    }, 150);

    return () => window.clearTimeout(timer);
  }, [map, cooks]);

  return null;
};

const CookDetailCard = ({
  cook,
  onViewProfile,
}: {
  cook: CookMapItem;
  onViewProfile: () => void;
}) => {
  const offline = isCookOffline(cook);

  return (
  <CardContent
    sx={{
      p: 2,
      position: 'relative',
      ...(offline
        ? {
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              backdropFilter: 'blur(2px)',
              backgroundColor: 'rgba(255,255,255,0.35)',
              pointerEvents: 'none',
              borderRadius: 1,
            },
          }
        : {}),
    }}
  >
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2 }}>
      <Avatar
        src={resolveUploadUrl(cook.profilePicUrl)}
        alt={cook.name}
        sx={{
          width: 56,
          height: 56,
          ...(offline ? { filter: 'blur(3px) grayscale(0.4)', opacity: 0.75 } : {}),
        }}
      >
        {cook.name.charAt(0)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="h6" fontWeight={700} noWrap>
          {cook.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {cook.area}, {cook.city}
        </Typography>
      </Box>
    </Box>

    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
      <Chip
        size="small"
        label={formatLabel(cook.availability)}
        color={availabilityColor(cook.availability)}
      />
      <Chip
        size="small"
        label={cook.isVerified ? 'Verified' : 'Unverified'}
        color={cook.isVerified ? 'success' : 'default'}
        variant="outlined"
      />
      <Chip
        size="small"
        label={cook.fssaiVerified ? 'FSSAI OK' : 'FSSAI pending'}
        color={cook.fssaiVerified ? 'success' : 'warning'}
        variant="outlined"
      />
    </Box>

    <Typography variant="body2" sx={{ mb: 0.5 }}>
      <strong>Phone:</strong> {cook.phone}
    </Typography>
    <Typography variant="body2" sx={{ mb: 0.5 }}>
      <strong>Email:</strong> {cook.email}
    </Typography>
    <Typography variant="body2" sx={{ mb: 0.5 }}>
      <strong>Address:</strong> {cook.address || '—'}
    </Typography>
    <Typography variant="body2" sx={{ mb: 1.5 }}>
      <strong>Rating:</strong> {cook.rating > 0 ? `${cook.rating} ★` : '—'} ·{' '}
      <strong>Orders:</strong> {cook.orders}
    </Typography>

    <Button size="small" variant="outlined" onClick={onViewProfile} sx={{ mb: 2 }}>
      View full profile
    </Button>

    <Divider sx={{ mb: 1.5 }} />

    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
      Today&apos;s menu
    </Typography>

    {cook.todayMenu.length === 0 ? (
      <Typography variant="body2" color="text.secondary">
        No menu items added for today.
      </Typography>
    ) : (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {cook.todayMenu.map((item) => (
          <Box
            key={item.id}
            sx={{
              display: 'flex',
              gap: 1.25,
              p: 1,
              borderRadius: 1.5,
              bgcolor: 'grey.50',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {item.image ? (
              <MenuThumb src={item.image} alt={item.name} />
            ) : (
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 1,
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}
              >
                🍽️
              </Box>
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600}>
                {item.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {formatLabel(item.category)}
              </Typography>
              <Typography variant="caption" color="primary" display="block">
                Ready: {formatReadyAt(item.readyAt)}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    )}
  </CardContent>
  );
};

const CookMapPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [cooks, setCooks] = useState<CookMapItem[]>([]);
  const [withoutLocation, setWithoutLocation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCook, setHoveredCook] = useState<CookMapItem | null>(null);

  const handleCookSelect = useCallback((cook: CookMapItem) => {
    setHoveredCook(cook);
  }, []);

  useEffect(() => {
    cooksApi
      .mapCooks()
      .then((res) => {
        setCooks(res.data.cooks);
        setWithoutLocation(res.data.withoutLocation);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const mapCenter = useMemo<[number, number]>(() => {
    if (cooks.length === 0) {
      return defaultCenter;
    }
    const avgLat = cooks.reduce((sum, cook) => sum + cook.lat, 0) / cooks.length;
    const avgLng = cooks.reduce((sum, cook) => sum + cook.lng, 0) / cooks.length;
    return [avgLat, avgLng];
  }, [cooks]);

  return (
    <Box>
      <GlobalStyles
        styles={{
          '.leaflet-div-icon.cook-map-marker': {
            background: 'transparent !important',
            border: 'none !important',
            width: `${MARKER_SIZE}px !important`,
            height: `${MARKER_TOTAL_HEIGHT}px !important`,
            overflow: 'visible !important',
          },
          '.leaflet-marker-icon.cook-map-marker': {
            overflow: 'visible !important',
          },
          '.leaflet-div-icon.cook-cluster-marker': {
            background: 'transparent !important',
            border: 'none !important',
          },
          '.cook-cluster-bubble': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #43a047 0%, #2e7d32 100%)',
            color: '#fff',
            fontWeight: 700,
            border: '3px solid #fff',
            boxShadow: '0 2px 12px rgba(0,0,0,0.28)',
          },
          '.marker-cluster-small, .marker-cluster-medium, .marker-cluster-large': {
            background: 'transparent !important',
          },
        }}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Cook Map
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {cooks.length} registered cook pin(s) · clustered map view
            {withoutLocation > 0 ? ` · ${withoutLocation} without GPS location` : ''}
            {cooks.some(isCookOffline)
              ? ` · ${cooks.filter(isCookOffline).length} offline (shown blurred)`
              : ''}
          </Typography>
        </Box>
        <Button variant="outlined" onClick={() => navigate('/cooks')}>
          Back to list
        </Button>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2,
          alignItems: 'stretch',
          minHeight: isMobile ? 'auto' : 'calc(100vh - 180px)',
        }}
      >
        <Box
          sx={{
            flex: 1,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            minHeight: MAP_HEIGHT,
            height: MAP_HEIGHT,
            position: 'relative',
            '& .leaflet-container': {
              width: '100%',
              height: `${MAP_HEIGHT}px`,
              zIndex: 0,
            },
          }}
        >
          {loading ? (
            <Box
              sx={{
                height: MAP_HEIGHT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <MapContainer
              center={mapCenter}
              zoom={11}
              scrollWheelZoom
              style={{ height: MAP_HEIGHT, width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />
              <FitCookBounds cooks={cooks} />
              <CookMarkerCluster cooks={cooks} onCookSelect={handleCookSelect} />
            </MapContainer>
          )}
        </Box>

        <Card
          sx={{
            width: isMobile ? '100%' : 380,
            flexShrink: 0,
            maxHeight: isMobile ? 'none' : 'calc(100vh - 180px)',
            overflow: 'auto',
          }}
        >
          {hoveredCook ? (
            <CookDetailCard
              cook={hoveredCook}
              onViewProfile={() => navigate(`/cooks/${hoveredCook.id}`)}
            />
          ) : (
            <CardContent>
              <Typography variant="body1" fontWeight={600} gutterBottom>
                Cook details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hover or click a map pin to see cook profile and today&apos;s menu items.
              </Typography>
            </CardContent>
          )}
        </Card>
      </Box>
    </Box>
  );
};

export default CookMapPage;
