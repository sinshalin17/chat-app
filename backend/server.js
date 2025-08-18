const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const USERS_FILE = path.join(__dirname, 'users.json');
const CHATS_FILE = path.join(__dirname, 'chats.json');
app.use(express.json());
app.use(cors());

const onlineUsers = {};

function getUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE));
}

function saveUser(user) {
  const users = getUsers();
  users.push(user);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users));
}

function findUser(username) {
  const users = getUsers();
  return users.find((u) => u.username === username);
}

// 🔒 Forgot Password: Reset password by username
app.post('/api/reset-password', (req, res) => {
  const { username, newPassword } = req.body;
  if (!username || !newPassword) {
    return res.status(400).json({ message: 'Username and new password are required' });
  }

  const users = getUsers();
  const index = users.findIndex((u) => u.username === username);
  if (index === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  users[index].password = newPassword;
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ message: 'Password reset successful' });
});

app.post('/api/signup', (req, res) => {
  const { username, password } = req.body;
  if (findUser(username)) {
    res.status(409).json({ message: 'User already exists' });
    return;
  }
  saveUser({ username, password });
  res.status(201).json({ message: 'User created' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = findUser(username);
  if (!user || user.password !== password) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }
  res.json({ message: 'Login successful' });
});

app.get('/api/users', (req, res) => {
  const users = getUsers().map((u) => u.username);
  res.json({ users });
});

app.post('/api/update-user', (req, res) => {
  const { username, name, password, newPassword } = req.body;
  const users = getUsers();
  const userIdx = users.findIndex((u) => u.username === username);
  if (userIdx === -1) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  if (users[userIdx].password !== password) {
    res.status(401).json({ message: 'Current password is incorrect' });
    return;
  }
  if (name && name !== username) {
    if (users.find((u) => u.username === name)) {
      res.status(409).json({ message: 'Username already taken' });
      return;
    }
    users[userIdx].username = name;
  }
  if (newPassword && newPassword.length > 0) {
    users[userIdx].password = newPassword;
  }
  fs.writeFileSync(USERS_FILE, JSON.stringify(users));
  res.json({ message: 'User updated' });
});

function getChats() {
  if (!fs.existsSync(CHATS_FILE)) return [];
  return JSON.parse(fs.readFileSync(CHATS_FILE));
}

function saveChat(message) {
  const chats = getChats();
  chats.push(message);
  fs.writeFileSync(CHATS_FILE, JSON.stringify(chats));
}

app.get('/api/chats', (req, res) => {
  res.json({ chats: getChats() });
});

app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.webm') res.setHeader('Content-Type', 'audio/webm');
    else if (ext === '.wav') res.setHeader('Content-Type', 'audio/wav');
    else if (ext === '.mp3') res.setHeader('Content-Type', 'audio/mpeg');
    res.sendFile(filePath);
    return;
  }
  res.status(404).send('File not found');
});

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on('connection', (ws) => {
  let username = null;

  ws.on('message', (msg) => {
    let data = {};
    try { data = JSON.parse(msg); } catch (e) { /* ignore parse errors */ }

    if (data.type === 'login') {
      username = data.username;
      onlineUsers[username] = ws;
      broadcast({ type: 'online-users', users: Object.keys(onlineUsers) });
    }
    else if (data.type === 'message') {
      const message = {
        type: 'message',
        username,
        text: data.text,
        time: new Date().toISOString(),
      };
      saveChat(message);
      broadcast(message);
    }
    else if (data.type === 'file' || data.type === 'voice') {
      const ext = data.filename.split('.').pop();
      const buffer = Buffer.from(data.data, 'base64');
      const safeName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = path.join(uploadDir, safeName);
      fs.writeFileSync(filePath, buffer);

      const message = {
        type: data.type,
        username,
        filename: data.filename,
        filetype: data.filetype,
        url: `/uploads/${safeName}`,
        time: new Date().toISOString(),
        ...(data.type === 'voice' && { duration: data.duration || null })
      };

      saveChat(message);
      broadcast(message);
    }
  });

  ws.on('close', () => {
    if (username) {
      delete onlineUsers[username];
      broadcast({ type: 'online-users', users: Object.keys(onlineUsers) });
    }
  });
});

server.listen(4000, '0.0.0.0', () => {
  console.log('Backend running on http://0.0.0.0:4000');
});
