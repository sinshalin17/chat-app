/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import React, { useEffect, useRef, useState } from 'react';
import {
  Box, Button, Paper, Stack, TextField, Typography, Divider,
  List, ListItem, ListItemText
} from '@mui/material';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import CloseIcon from '@mui/icons-material/Close';
import { WS_BASE, API_BASE, blobToBase64 } from './utils';

export default function ChatPage({ username }) {
  const [ws, setWs] = useState(null);
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [online, setOnline] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingFileUrl, setPendingFileUrl] = useState('');
  const [pendingVoice, setPendingVoice] = useState(null);
  const [pendingVoiceUrl, setPendingVoiceUrl] = useState('');
  const [recording, setRecording] = useState(false);
  const chatEndRef = useRef();
  const fileInputRef = useRef();
  const mediaRecorderRef = useRef(null);
  const prevChatLength = useRef(0);

  useEffect(() => {
    fetch(`${API_BASE}/api/chats`)
      .then((res) => res.json())
      .then((data) => setChat(data.chats || []));
    const socket = new window.WebSocket(WS_BASE);
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'login', username }));
    };
    socket.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type === 'message' || data.type === 'file' || data.type === 'voice') {
        setChat((prev) => [...prev, data]);
      } else if (data.type === 'online-users') {
        setOnline(data.users);
      }
    };
    setWs(socket);
    return () => socket.close();
  }, [username]);

  useEffect(() => {
    if (chat.length > prevChatLength.current) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevChatLength.current = chat.length;
  }, [chat]);

  const send = async (e) => {
    e.preventDefault();
    if (pendingFile && ws) {
      const reader = new FileReader();
      reader.onload = () => {
        ws.send(JSON.stringify({
          type: 'file',
          filename: pendingFile.name,
          filetype: pendingFile.type,
          data: reader.result.split(',')[1],
        }));
        setPendingFile(null);
        setPendingFileUrl('');
      };
      reader.readAsDataURL(pendingFile);
      return;
    }

    if (pendingVoice && ws) {
      const base64 = await blobToBase64(pendingVoice);
      ws.send(JSON.stringify({
        type: 'voice',
        filename: `voice_${Date.now()}.webm`,
        filetype: 'audio/webm',
        data: base64,
      }));
      setPendingVoice(null);
      setPendingVoiceUrl('');
      return;
    }

    if (input.trim() && ws) {
      ws.send(JSON.stringify({ type: 'message', text: input }));
      setInput('');
    }

    setShowEmojiPicker(false);
  };

  const sendFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPendingFile(file);
      setPendingFileUrl(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      window.console.error('Voice recording is not supported in this browser.');
      setRecording(false);
      return;
    }

    let mimeType = '';
    if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
    else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
    else if (MediaRecorder.isTypeSupported('audio/wav')) mimeType = 'audio/wav';
    else {
      window.console.error('No supported audio format for recording in this browser.');
      setRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        setPendingVoice(blob);
        setPendingVoiceUrl(URL.createObjectURL(blob));
      };
      setRecording(true);
      mediaRecorder.start();
    } catch (err) {
      window.console.error('Microphone access denied or not available.', err);
      setRecording(false);
    }
  };

  const stopRecording = () => {
    setRecording(false);
    mediaRecorderRef.current?.stop();
  };

  const cancelFile = () => {
    setPendingFile(null);
    setPendingFileUrl('');
  };

  const cancelVoice = () => {
    setPendingVoice(null);
    setPendingVoiceUrl('');
  };

  const handleEmoji = (emoji) => {
    setInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        backgroundImage: 'url("https://i.postimg.cc/ZnCkjqyT/faf22eaf-7d73-4f8b-9dc2-c60cf5387878.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 3,
          maxWidth: 800,
          width: '100%',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          backgroundColor: 'rgba(255, 255, 255, 0.85)', // overlay for readability
          backdropFilter: 'none',
        }}
      >
        <Box flex={2} pr={{ md: 2 }} borderRight={{ md: '1px solid #eee' }}>
          <Typography variant="h6" fontWeight={600} mb={1}>Chat</Typography>
          <Box sx={{ height: 350, overflowY: 'auto', background: '#fafafa', p: 1, borderRadius: 1, border: '1px solid #eee', mb: 2 }}>
            {chat.map((msg) => (
              msg.type === 'file' ? (
                <Box key={msg.time + msg.username + msg.filename} mb={0.5}>
                  <Typography component='span' fontWeight={600} color={msg.username === username ? 'primary.main' : 'text.primary'}>
                    {msg.username}:&nbsp;
                  </Typography>
                  <a
                    href={msg.url ? `${API_BASE}${msg.url}` : `data:${msg.filetype};base64,${msg.data}`}
                    download={msg.filename}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'underline', color: '#1976d2' }}
                  >
                    {msg.filename}
                    <AttachFileIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />
                  </a>
                  <Typography component="span" fontSize={10} color="text.secondary" ml={1}>
                    {msg.time ? new Date(msg.time).toLocaleTimeString() : ''}
                  </Typography>
                </Box>
              ) : msg.type === 'voice' ? (
                <Box key={msg.time + msg.username + msg.filename} mb={0.5}>
                  <Typography component="span" fontWeight={600} color={msg.username === username ? 'primary.main' : 'text.primary'}>
                    {msg.username}:&nbsp;
                  </Typography>
                  <audio src={msg.url ? `${API_BASE}${msg.url}` : ''} controls style={{ verticalAlign: 'middle', maxHeight: 40 }} />
                  <Typography component="span" fontSize={10} color="text.secondary" ml={1}>
                    {msg.time ? new Date(msg.time).toLocaleTimeString() : ''}
                  </Typography>
                </Box>
              ) : (
                <Box key={msg.time + msg.username} mb={0.5} color={msg.username === username ? 'primary.main' : 'text.primary'}>
                  <Typography component="span" fontWeight={600}>
                    {msg.username}:&nbsp;
                  </Typography>
                  <Typography component="span">{msg.text}</Typography>
                  <Typography component="span" fontSize={10} color="text.secondary" ml={1}>
                    {msg.time ? new Date(msg.time).toLocaleTimeString() : ''}
                  </Typography>
                </Box>
              )
            ))}
            <div ref={chatEndRef} />
          </Box>

          <form onSubmit={send} style={{ position: 'relative' }}>
            {(pendingFile || pendingVoice) && (
              <Box mb={1}>
                {pendingFile && (
                  <Box display="flex" alignItems="center" gap={2} bgcolor="#e3f2fd" px={2} py={1} borderRadius={2} boxShadow={2}>
                    {pendingFile.type.startsWith('image') ? (
                      <img src={pendingFileUrl} alt="preview" style={{ maxHeight: 56, maxWidth: 56, borderRadius: 10, boxShadow: '0 2px 8px #90caf9' }} />
                    ) : (
                      <AttachFileIcon sx={{ color: '#1976d2', fontSize: 32 }} />
                    )}
                    <Typography fontSize={15} fontWeight={600} color="primary.main">{pendingFile.name}</Typography>
                    <Button size="small" onClick={cancelFile} color="error" sx={{ minWidth: 0, p: 0.5, ml: 'auto' }}><CloseIcon fontSize="small" /></Button>
                  </Box>
                )}
                {pendingVoice && (
                  <Box display="flex" alignItems="center" gap={2} bgcolor="#e3f2fd" px={2} py={1} borderRadius={2} boxShadow={2} mt={pendingFile ? 1 : 0}>
                    <Box display="flex" alignItems="center" justifyContent="center" sx={{ background: '#fff', borderRadius: '50%', width: 40, height: 40, boxShadow: '0 2px 8px #90caf9' }}>
                      <MicIcon sx={{ color: '#1976d2', fontSize: 24 }} />
                    </Box>
                    <audio src={pendingVoiceUrl} controls style={{ maxHeight: 40, marginLeft: 8 }} />
                    <Button size="small" onClick={cancelVoice} color="error" sx={{ minWidth: 0, p: 0.5, ml: 'auto' }}><CloseIcon fontSize="small" /></Button>
                  </Box>
                )}
              </Box>
            )}
            <Stack direction="row" spacing={1} alignItems="center">
              <Button variant="outlined" component="span" onClick={() => fileInputRef.current.click()} sx={{ minWidth: 0, p: 1, background: pendingFile ? '#e3f2fd' : undefined }} disabled={!!pendingVoice}>
                <AttachFileIcon />
              </Button>
              <Button
                variant={recording ? 'contained' : 'outlined'}
                color={recording ? 'error' : 'primary'}
                onClick={recording ? stopRecording : startRecording}
                sx={{
                  minWidth: 0, p: 1,
                  background: recording ? '#e3f2fd' : undefined,
                  boxShadow: recording ? '0 0 0 4px #90caf9' : undefined
                }}
                disabled={!!pendingFile}
              >
                {recording ? <StopIcon sx={{ color: '#d32f2f', fontSize: 24 }} /> : <MicIcon sx={{ color: '#1976d2', fontSize: 24 }} />}
              </Button>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={sendFile} />
              <TextField
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                size="small"
                fullWidth
                sx={{ background: '#fff', borderRadius: 2 }}
              />
              <Button variant="outlined" component="span" onClick={() => setShowEmojiPicker((v) => !v)} sx={{ minWidth: 0, p: 1 }}>
                <InsertEmoticonIcon />
              </Button>
              <Button type="submit" variant="contained" disabled={!(input.trim() || pendingFile || pendingVoice)}>
                Send
              </Button>
            </Stack>
            {showEmojiPicker && (
              <Box sx={{ position: 'absolute', zIndex: 10, mt: 1, left: 0, background: '#fff', border: '1px solid #eee', borderRadius: 1, p: 1 }}>
                <Stack direction="row" spacing={1}>
                  {['😀', '😂', '😍', '👍', '🙏', '🎉', '😎', '😢', '😡', '❤️'].map((emoji) => (
                    <Button key={emoji} onClick={() => handleEmoji(emoji)}>{emoji}</Button>
                  ))}
                </Stack>
              </Box>
            )}
          </form>
        </Box>

        <Box flex={1} pl={{ md: 2 }} mt={{ xs: 3, md: 0 }}>
          <Typography variant="h6" fontWeight={600} mb={1}>Online Users</Typography>
          <Divider sx={{ mb: 1 }} />
          <List dense>
            {online.map((u) => (
              <ListItem key={u}>
                <ListItemText
                  primary={u === username ? `${u} (You)` : u}
                  primaryTypographyProps={{ color: u === username ? 'primary' : 'text.primary' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>
    </Box>
  );
}

