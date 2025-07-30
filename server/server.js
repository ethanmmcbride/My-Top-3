const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
connectDB();
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*', // or '*' for dev 'http://localhost:5173'
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.set('io', io);

// API routes
app.use('/api/spotify', require('./routes/spotify'));
app.use('/api/lyrics', require('./routes/lyricsovh'));
app.use('/api/gemini', require('./routes/gemini'));
app.use('/', require('./routes/auth'));
app.use('/api/lists', require('./routes/SongLists'));


const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});