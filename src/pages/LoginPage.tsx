import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, Alert } from '@mui/material';
import { AppDispatch, RootState } from '../redux/store';
import { loginRequest, loginSuccess, loginFailure } from '../redux/reducers/authReducer';
import { authApi } from '../services/api/authApi';
import { saveSession } from '../services/auth/sessionStorage';

const LoginPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((s: RootState) => s.auth);
  const [email, setEmail] = useState('admin@ammakakhana.com');
  const [password, setPassword] = useState('Admin@123');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginRequest());
    try {
      const res = await authApi.adminLogin(email.trim(), password);
      const session = {
        user: res.data.user,
        token: res.data.tokens.accessToken,
        refreshToken: res.data.tokens.refreshToken,
      };
      saveSession(session);
      dispatch(loginSuccess(session));
      navigate('/');
    } catch (err: unknown) {
      dispatch(loginFailure(err instanceof Error ? err.message : 'Login failed'));
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Paper sx={{ p: 4, width: 400 }} component="form" onSubmit={handleLogin}>
        <Typography variant="h5" fontWeight={700} color="primary" textAlign="center" gutterBottom>
          AMMA KA KHANA
        </Typography>
        <Typography variant="body2" textAlign="center" color="text.secondary" mb={3}>
          Admin Panel Login
        </Typography>

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <TextField
          fullWidth
          label="Email"
          type="email"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button fullWidth variant="contained" size="large" sx={{ mt: 2 }} type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </Paper>
    </Box>
  );
};

export default LoginPage;
