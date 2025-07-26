const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get('/:artist/:song', async (req, res) => {
  const { artist, song } = req.params;
  console.log(`Fetching lyrics for ${artist} - ${song}`);
  
  try {
    const response = await axios.get(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`
    );
    res.json(response.data);
  } catch (err) {
    console.error('Lyrics.ovh API error:', err.message);
    if (err.response) {
      res.status(err.response.status).json({ error: 'Failed to fetch lyrics' });
    } else {
      res.status(500).json({ error: 'Failed to fetch lyrics' });
    }
  }
});

module.exports = router;