import React from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const SHOP_TABS = [
  { label: 'Dashboard', path: '/shop' },
  { label: 'Categories', path: '/shop/categories' },
  { label: 'Products', path: '/shop/products' },
  { label: 'Orders', path: '/shop/orders' },
  { label: 'Settings', path: '/shop/settings' },
];

const ShoppingLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeIndex = SHOP_TABS.findIndex((tab) => {
    if (tab.path === '/shop') {
      return location.pathname === '/shop';
    }
    return location.pathname.startsWith(tab.path);
  });

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Kit Shop
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Manage platform kits, cook shop orders, and earnings
      </Typography>

      <Tabs
        value={activeIndex >= 0 ? activeIndex : 0}
        onChange={(_, index) => navigate(SHOP_TABS[index].path)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        {SHOP_TABS.map((tab) => (
          <Tab key={tab.path} label={tab.label} />
        ))}
      </Tabs>

      <Outlet />
    </Box>
  );
};

export default ShoppingLayout;
