/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, Paper } from '@mui/material';
import { API_BASE } from './utils';

export default function SettingsPage({ username, onUpdate, onBack }) {
  const [name, setName] = useState(username);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/update-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, name, password, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      setSuccess('Profile updated successfully.');
      if (onUpdate) onUpdate(name);
    }
    catch (err) {
      setError(err.message);
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
      <Paper sx={{ p: 4, minWidth: 350 }}>
        <Typography variant='h5' mb={2}>Settings</Typography>
        <form onSubmit={handleUpdate}>
          <TextField
            label='Username'
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin='normal'
            required
          />
          <TextField
            label='Current Password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin='normal'
            required
          />
          <TextField
            label='New Password'
            type='password'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            margin='normal'
          />
          {error && <Alert severity='error' sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity='success' sx={{ mt: 2 }}>{success}</Alert>}
          <Box mt={2} display='flex' gap={2}>
            <Button variant='contained' color='primary' type='submit' disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant='outlined' onClick={onBack}>Back</Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
