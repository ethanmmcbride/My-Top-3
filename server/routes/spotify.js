const express = require('express');
const axios = require('axios');
const querystring = require('querystring');

const router = express.Router();

// Replace these with your actual credentials
const CLIENT_ID = '72183dd0908241ee86e1067f9e3f0f97';
const CLIENT_SECRET = '29ba8da169dd457fb7c2eb566ebd255c';
const ARTIST_ID = '2ye2Wgw4gimLv2eAKyk1NB'; // Metallica's Spotify ID

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