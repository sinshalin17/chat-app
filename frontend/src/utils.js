// Dynamically detect the current host for API and WebSocket base URLs
const getHost = () => {
  // Use window.location.hostname for FE host, fallback to localhost
  const host = window?.location?.hostname || 'localhost';
  return host;
};

export const API_BASE = `http://${getHost()}:4000`;

export const WS_BASE = `ws://${getHost()}:4000`; // <-- replace with your actual IP

export function saveSession(username) {
  window.sessionStorage.setItem('chat-user', username);
}

export function getSession() {
  return window.sessionStorage.getItem('chat-user');
}

export function clearSession() {
  window.sessionStorage.removeItem('chat-user');
}

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
