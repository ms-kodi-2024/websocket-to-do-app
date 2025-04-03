const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

const server = http.createServer(app);
const io = socketIo(server);

let tasks = [];

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socket.emit('updateData', tasks);
  socket.on('addTask', (task) => {
    tasks.push(task);
    socket.broadcast.emit('addTask', task);
  });
  socket.on('removeTask', (taskId) => {
    tasks = tasks.filter(task => task.id !== taskId);
    socket.broadcast.emit('removeTask', taskId);
  });
});

server.listen(process.env.PORT || 8000, () => {
  console.log('Server is running...');
});

app.use((req, res) => {
  res.status(404).send({ message: 'Not found...' });
});
