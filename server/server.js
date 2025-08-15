const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const path = require('path');
app.use(express.static(path.join(__dirname, '..'))); // Serve static files from the project root

let rooms = {};

io.on('connection', (socket) => {

  // Join a room (client emits 'joinRoom' with roomId)
  socket.on('joinRoom', (roomId) => {
    // Create room if it doesn't exist
    if (!rooms[roomId]) {
      rooms[roomId] = { players: [] };
    }
    // Add player to room
    rooms[roomId].players.push(socket.id);
    socket.join(roomId);

    // Assign marker (first player is 'X', second is 'O')
    let marker = rooms[roomId].players.length === 1 ? 'X' : 'O';
    socket.emit('markerAssigned', marker);

    // Notify both players when ready
    if (rooms[roomId].players.length === 2) {
      io.to(roomId).emit('startGame');
    } else {
      socket.emit('waiting');
    }
  });

  // Handle player move
  socket.on('move', (data) => {
    console.debug("on move");
    const roomId = Object.keys(rooms).find(id => rooms[id].players.includes(socket.id));
    socket.to(roomId).emit('move', data); // Broadcast move to other player
  });

  // Handle game end
  socket.on('gameEnd', (result) => {
    const roomId = Object.keys(rooms).find(id => rooms[id].players.includes(socket.id));
    if (roomId) {
      io.to(roomId).emit('gameEnd', result);
    }
  });

  // Handle manual disconnect
  socket.on('manual-disconnect', () => {
    console.debug("on manual disconnect");
    for (const roomId in rooms) {
      const idx = rooms[roomId].players.indexOf(socket.id);
      if (idx !== -1) {
        rooms[roomId].players.splice(idx, 1);
        // Optionally notify other player
        io.to(roomId).emit('playerLeft');
        // Remove room if empty
        if (rooms[roomId].players.length === 0) {
          delete rooms[roomId];
        }
        break;
      }
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.debug("on disconnect");
    for (const roomId in rooms) {
      const idx = rooms[roomId].players.indexOf(socket.id);
      if (idx !== -1) {
        rooms[roomId].players.splice(idx, 1);
        // Optionally notify other player
        io.to(roomId).emit('playerLeft');
        // Remove room if empty
        if (rooms[roomId].players.length === 0) {
          delete rooms[roomId];
        }
        break;
      }
    }
  });
});

server.listen(3000, () => console.log('Server running on port 3000'));