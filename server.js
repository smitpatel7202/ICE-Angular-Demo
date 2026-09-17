const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
 
const app = express();
const server = http.createServer(app);
 
// Single 'io' declaration with CORS enabled
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
 
 io.on('connection', (socket) => {
  console.log('a user connected', socket.id);
 
  socket.on('chat message', (msg) => {
    console.log('received chat message from', socket.id, msg);
    // Broadcast message to all other connected clients
    socket.broadcast.emit('chat message', msg);
  });
 
  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
  });
});
 
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});