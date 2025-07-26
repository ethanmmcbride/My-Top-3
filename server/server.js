const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

// API routes
app.use('/api/spotify', require('./routes/spotify'));
app.use('/api/lyrics', require('./routes/lyricsovh'));

// Future: app.use('/api/itunes', require('./routes/itunes'))

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});