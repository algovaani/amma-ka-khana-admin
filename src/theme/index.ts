import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#E65100' },
    secondary: { main: '#FF8F00' },
    success: { main: '#4CAF50' },
    background: { default: '#F5F5F5', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: { borderRight: 'none', boxShadow: '2px 0 8px rgba(0,0,0,0.08)' },
      },
    },
  },
});
