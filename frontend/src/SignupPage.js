/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  
  Typography,
  Alert
} from '@mui/material';
import { API_BASE } from './utils';

export default function SignupPage({ goToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const signup = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('Signup successful! Please login.');
      } else {
        setMsg(data.message);
      }
    } catch (err) {
      setMsg('Network error');
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        backgroundImage: 'url("https://i.ibb.co/hF1tS8d8/login-image.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        overflow: 'hidden',
        px: 2,
      }}
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgcolor="rgba(0, 0, 0, 0.5)" // dark overlay for contrast
      />
      <Paper
        elevation={6}
        sx={{
          zIndex: 1,
          p: 4,
          minWidth: 340,
          maxWidth: 380,
          width: '100%',
          backdropFilter: 'blur(6px)',
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 3,
        }}
      >
        <Stack spacing={3}>
          <Typography variant="h5" fontWeight={600} align="center" color="primary">
            Sign Up
          </Typography>
          <form onSubmit={signup}>
            <Stack spacing={2}>
              <TextField
                label="Username"
                value={username}
                required
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                autoFocus
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
              />
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Sign Up
              </Button>
            </Stack>
          </form>
          {msg && (
            <Alert severity={msg.includes('successful') ? 'success' : 'error'}>
              {msg}
            </Alert>
          )}
          <Typography align="center" variant="body2">
            Already have an account?
            <Button onClick={goToLogin} size="small">Login</Button>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
