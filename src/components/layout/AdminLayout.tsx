import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Restaurant,
  Receipt,
  AccountBalanceWallet,
  Settings,
  Category,
  LunchDining,
  LocalOffer,
  Campaign,
  CardGiftcard,
  Support,
  Assessment,
  LocationOn,
  Map as MapIcon,
  Logout,
  Storefront,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/reducers/authReducer';
import AdminNotificationBell from '../AdminNotificationBell';

const DRAWER_WIDTH = 260;

const menuItems = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/' },
  { label: 'Users', icon: <People />, path: '/users' },
  { label: 'Cook Partners', icon: <Restaurant />, path: '/cooks' },
  { label: 'Cook Map', icon: <MapIcon />, path: '/map/cooks' },
  { label: 'Orders', icon: <Receipt />, path: '/orders' },
  { label: 'Wallet', icon: <AccountBalanceWallet />, path: '/wallet' },
  { label: 'Withdrawals', icon: <AccountBalanceWallet />, path: '/withdrawals' },
  { label: 'Referrals', icon: <CardGiftcard />, path: '/referrals' },
  { label: 'Locations', icon: <LocationOn />, path: '/locations' },
  { label: 'Categories', icon: <Category />, path: '/categories' },
  { label: 'Meal Package', icon: <LunchDining />, path: '/meal-package' },
  { label: 'Coupons', icon: <LocalOffer />, path: '/coupons' },
  { label: 'Banners', icon: <Campaign />, path: '/banners' },
  { label: 'Kit Shop', icon: <Storefront />, path: '/shop' },
  { label: 'Reports', icon: <Assessment />, path: '/reports' },
  { label: 'Support', icon: <Support />, path: '/support' },
  { label: 'Settings', icon: <Settings />, path: '/settings' },
];

interface Props {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" fontWeight={700} color="primary">
          AMMA KA KHANA
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={
              item.path === '/map/cooks'
                ? location.pathname === '/map/cooks'
                : item.path === '/shop'
                  ? location.pathname === '/shop' || location.pathname.startsWith('/shop/')
                : location.pathname === item.path ||
                  (item.path === '/cooks' &&
                    location.pathname.startsWith('/cooks/') &&
                    location.pathname !== '/cooks/map')
            }
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
            sx={{ mx: 1, borderRadius: 1, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
        <ListItemButton onClick={handleLogout} sx={{ mx: 1, borderRadius: 1, mt: 1 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Admin Panel
          </Typography>
          <AdminNotificationBell />
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
