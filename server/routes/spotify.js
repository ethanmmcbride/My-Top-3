const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
require('dotenv').config({ path: '../.env' });

const router = express.Router();

// Replace these with your actual credentials
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const ARTIST_ID = process.env.SPOTIFY_METALLICA_ID; // Metallica's Spotify ID
console.log('Client ID:', process.env.SPOTIFY_CLIENT_ID);
console.log('Client Secret:', process.env.SPOTIFY_CLIENT_SECRET ? 'Present' : 'Missing');

async function getAccessToken() {
  console.log('Attempting to get access token...');
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'client_credentials'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
        }
      }
    );
    console.log('Successfully obtained access token');
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
    throw error;
  }
}

// Testing Artist Get by ID
router.get('/', async (req, res) => {
  console.log('Entering Spotify route');
  try {
    const token = await getAccessToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/artists/${ARTIST_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    console.log('Successfully retrieved Spotify artist data');
    res.json(response.data);
  } catch (err) {
    console.error('Spotify route error:', err.message);
    res.status(500).json({ error: 'Failed to fetch artist data' });
  }
});

module.exports = router;
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query parameter "q" is required' });

    const token = await getAccessToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error('Spotify search error:', err.message);
    res.status(500).json({ error: 'Failed to search songs' });
  }
});