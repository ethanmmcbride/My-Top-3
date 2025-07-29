const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
connectDB();

const app = express();
app.use(cors());
app.use(express.json());


// API routes
app.use('/api/spotify', require('./routes/spotify'));
app.use('/api/lyrics', require('./routes/lyricsovh'));
app.use('/api/gemini', require('./routes/gemini'));
app.use('/', require('./routes/auth'));
app.use('/api/lists', require('./routes/SongLists'));


const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});