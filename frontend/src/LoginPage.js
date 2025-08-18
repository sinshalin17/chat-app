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
import { saveSession, API_BASE } from './utils';

export default function LoginPage({ onLogin, goToSignup }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMsg, setResetMsg] = useState('');

  const login = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        saveSession(username);
        onLogin(username);
      } else {
        const data = await res.json();
        setMsg(data.message);
      }
    } catch (err) {
      setMsg('Network error');
    }
  };

  const handleResetPassword = async () => {
    setResetMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: resetUsername, newPassword }),
      });

      const data = await res.json();
      setResetMsg(data.message);
      if (res.ok) {
        setShowReset(false);
        setResetUsername('');
        setNewPassword('');
      }
    } catch (err) {
      setResetMsg('Error resetting password');
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
        bgcolor="rgba(0, 0, 0, 0.5)"
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
            Login
          </Typography>

          <form onSubmit={login}>
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
                Login
              </Button>
            </Stack>
          </form>

          {msg && <Alert severity="error">{msg}</Alert>}

          <Typography
            variant="body2"
            align="center"
            sx={{ color: 'blue', cursor: 'pointer' }}
            onClick={() => setShowReset(!showReset)}
          >
            Forgot Password?
          </Typography>

          {showReset && (
            <Stack spacing={2}>
              <TextField
                label="Username"
                value={resetUsername}
                onChange={(e) => setResetUsername(e.target.value)}
                fullWidth
              />
              <TextField
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
              />
              <Button variant="outlined" color="secondary" onClick={handleResetPassword}>
                Reset Password
              </Button>
              {resetMsg && (
                <Alert severity={resetMsg.includes('successful') ? 'success' : 'error'}>
                  {resetMsg}
                </Alert>
              )}
            </Stack>
          )}

          <Typography align="center" variant="body2">
            New user?
            <Button onClick={goToSignup} size="small">Sign up</Button>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
