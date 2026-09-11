const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);
  socket.on('chat message', (msg) => {
    // Log and broadcast the message to all other clients
    console.log('received chat message from', socket.id, msg);
    socket.broadcast.emit('chat message', msg);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

const io = new Server(server, {
  cors: {
    origin: "*", // Allows connections from Vercel domain
    methods: ["GET", "POST"]
  }
});
