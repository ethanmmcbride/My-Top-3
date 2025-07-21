const axios = require('axios');
const querystring = require('querystring');

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

async function getArtistData(accessToken) {
  console.log('Attempting to get artist data...');
  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/artists/${ARTIST_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    console.log('Successfully retrieved artist data');
    return response.data;
  } catch (error) {
    console.error('Error getting artist data:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
    throw error;
  }
}

async function main() {
  try {
    const accessToken = await getAccessToken();
    const artistData = await getArtistData(accessToken);
    console.log('\nArtist Data:');
    console.log(JSON.stringify(artistData, null, 2));
    console.log('\nSuccessfully completed!');
  } catch (error) {
    console.error('\nScript failed to complete:');
    console.error(error.message);
    process.exit(1); // Exit with error code
  }
}

// Add a message to indicate script start
console.log('Starting Spotify API script...\n');
main();