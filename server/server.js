const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

// Mount API routes
app.use('/api/spotify', require('./routes/spotify'));

// Future: app.use('/api/itunes', require('./routes/itunes'))

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});