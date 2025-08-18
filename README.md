📌 Real-Time Chat Application
📖 Project Overview

This is a real-time chat application that runs on both desktop and mobile web browsers. It features user authentication (signup & login), WebSocket-powered instant messaging, and a live online users list.
Each browser tab maintains its own user session, allowing different users to be logged in across different tabs.

✨ Features

🔐 User signup and login

🖥️ Per-tab user sessions using sessionStorage

⚡ Real-time group chat (messages appear instantly)

👥 Live online users list

📱 Works seamlessly on desktop & mobile browsers

🛠️ Technologies Used
Technology	Where Used	Why
React	Frontend	Fast, modern, component-based UI framework suitable for web & mobile.
Node.js	Backend	Scalable, non-blocking runtime for real-time apps.
Express	Backend	Minimalist framework for handling REST APIs.
ws (WebSocket)	Backend	Enables real-time two-way communication.
WebSocket API	Frontend	For real-time messaging with backend.
sessionStorage	Frontend	Keeps sessions isolated per tab.
CORS	Backend	Allows frontend-backend communication during development.

📂 Project Structure
chat-app/

├── backend/
│   ├── server.js         # Node.js backend with WebSocket & REST API
│   └── users.json        # User database (JSON)
├── frontend/
│   ├── package.json      # React app config & dependencies
│   ├── public/
│   │   └── index.html    # HTML entry
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── LoginPage.js
│       ├── SignupPage.js
│       ├── ChatPage.js
│       └── utils.js

⚙️ Setup Instructions
🔑 Prerequisites

Node.js (v16.x or v18.x recommended)

npm (v8.x or later)

(Optional) Git Bash / WSL for Windows

🚀 Installation

1. Clone the repository

git clone https://github.com/your-username/chat-app.git
cd chat-app


2. Install dependencies

Backend:

cd backend
npm install


Frontend:

cd frontend
npm install


3. Run the app

Start Backend (port 4000):

cd backend
node server.js


Start Frontend (port 3000):

cd frontend
npm start


Now open http://localhost:3000 in your browser. 🎉

🔎 How It Works

Authentication: Users sign up/login via REST API, credentials stored in users.json.

Session Handling: sessionStorage ensures per-tab sessions.

Real-Time Chat: WebSockets broadcast messages & update online users instantly.

Message Flow:

User types a message → ChatPage.js sends via WebSocket

Backend receives & broadcasts to all clients

All clients update chat in real time

❓ Common Questions

Can I log in with different users on different tabs?
✅ Yes, sessionStorage keeps sessions isolated per tab.

Is this production-ready?
⚠️ No. This demo app does not hash passwords or use HTTPS. Use proper security for production.

Can I use it on mobile?
✅ Yes, it works in any modern mobile browser.

🌐 Deployment Notes

Update frontend URLs to match deployed backend (instead of localhost).

Use HTTPS/WSS in production with reverse proxies like Nginx or Heroku/Vercel/Netlify.

🛠️ Troubleshooting

❌ npm install stuck → Clear npm cache or try Yarn.

❌ WebSocket not connecting → Ensure backend is running.

❌ Login/signup failing → Check backend terminal for errors.

❌ Windows issues → Use Git Bash or WSL.
