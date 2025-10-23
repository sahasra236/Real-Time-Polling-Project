const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// Keep track of user votes in memory (socket.id)
let userVotes = {}; // { socketId: { pollId: option } }

io.on('connection', socket => {
  console.log('User connected:', socket.id);

  // Send all polls on connection
  db.query('SELECT * FROM polls', (err, result) => {
    if (err) throw err;
    socket.emit('pollData', result);
  });

  // Handle vote toggle
  socket.on('vote', data => {
    const prevVote = userVotes[socket.id]?.[data.pollId];

    if (prevVote === data.option) {
      // User clicked same option → remove vote
      const column = data.option === 1 ? 'votes1' : 'votes2';
      db.query(`UPDATE polls SET ${column} = ${column} - 1 WHERE id = ?`, [data.pollId], err => {
        if (err) console.error(err);
      });
      delete userVotes[socket.id][data.pollId];
    } else {
      // If previously voted on other option, remove it first
      if (prevVote) {
        const prevColumn = prevVote === 1 ? 'votes1' : 'votes2';
        db.query(`UPDATE polls SET ${prevColumn} = ${prevColumn} - 1 WHERE id = ?`, [data.pollId], err => {
          if (err) console.error(err);
        });
      }

      // Add new vote
      const column = data.option === 1 ? 'votes1' : 'votes2';
      db.query(`UPDATE polls SET ${column} = ${column} + 1 WHERE id = ?`, [data.pollId], err => {
        if (err) console.error(err);
      });

      userVotes[socket.id] = userVotes[socket.id] || {};
      userVotes[socket.id][data.pollId] = data.option;
    }

    // Send updated polls to all clients
    db.query('SELECT * FROM polls', (err, result) => {
      if (err) throw err;
      io.emit('pollData', result);
    });
  });

  // Clean up on disconnect
  socket.on('disconnect', () => {
    delete userVotes[socket.id];
    console.log('User disconnected:', socket.id);
  });
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
