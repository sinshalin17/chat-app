/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Avatar, Menu, MenuItem, IconButton, Box } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import ChatPage from './ChatPage';
import SettingsPage from './SettingsPage';
import { getSession } from './utils';

const APPBAR_HEIGHT = 64; // px, adjust if needed

export default function App() {
  const [page, setPage] = useState(getSession() ? 'chat' : 'login');
  const [user, setUser] = useState(getSession());
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleLogin = (username) => {
    setUser(username);
    setPage('chat');
  };

  const handleLogout = () => {
    setUser(null);
    setPage('login');
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar position='fixed' color='primary' sx={{ zIndex: 1300 }}>
        <Toolbar>
          <Typography variant='h6' sx={{ flexGrow: 1, fontWeight: 700 }}>
            Chat App
          </Typography>
          {user && (
            <>
              <IconButton onClick={handleAvatarClick} color='inherit' size='large'>
                <Avatar sx={{ bgcolor: '#1976d2' }}>{user[0]?.toUpperCase()}</Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    setPage('settings');
                  }}
                >
                  <SettingsIcon fontSize='small' sx={{ mr: 1 }} />
                  Settings
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    handleLogout();
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          mt: `${APPBAR_HEIGHT}px`,
          height: `calc(100vh - ${APPBAR_HEIGHT}px)`,
          overflow: 'hidden',
        }}
      >
        {page === 'login' && <LoginPage onLogin={handleLogin} goToSignup={() => setPage('signup')} />}
        {page === 'signup' && <SignupPage goToLogin={() => setPage('login')} />}
        {page === 'chat' && user && (
          <ChatPage
            username={user}
            onLogout={handleLogout}
            onSettings={() => setPage('settings')}
          />
        )}
        {page === 'settings' && user && (
          <SettingsPage
            username={user}
            onUpdate={(newName) => {
              setUser(newName);
              window.sessionStorage.setItem('chat-user', newName);
            }}
            onBack={() => setPage('chat')}
          />
        )}
      </Box>
    </>
  );
}
