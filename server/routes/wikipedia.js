const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/:artist', async (req, res) => {
  const artist = req.params.artist;

  try {
    const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(artist)}`);
    res.json(response.data);
  } catch (err) {
    console.error('Wikipedia error:', err.message);
    res.status(500).json({ error: 'Could not fetch artist info' });
  }
});

module.exports = router;