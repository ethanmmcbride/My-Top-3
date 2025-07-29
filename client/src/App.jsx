import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [artist, setArtist] = useState(null);
  const [lyrics, setLyrics] = useState(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [recommendationsGemini, setRecommendationsGemini] = useState(null);
  const [loadingGemini, setLoadingGemini] = useState(false);
  const [errorGemini, setErrorGemini] = useState(null);

  useEffect(() => {
    fetch('/api/spotify')
      .then((res) => res.json())
      .then((data) => {
        console.log('Received data:', data);
        setArtist(data);
      })
      .catch((err) => console.error('Error fetching artist:', err));
  }, []);

  const fetchLyrics = () => {
    setLoadingLyrics(true);
    fetch('/api/lyrics/Metallica/Enter Sandman')
      .then((res) => res.json())
      .then((data) => {
        setLyrics(data.lyrics);
        setLoadingLyrics(false);
      })
      .catch((err) => {
        console.error('Error fetching lyrics:', err);
        setLoadingLyrics(false);
      });
  };

  const getMetallicaRecommendations = async () => {
    setLoadingGemini(true);
    setErrorGemini(null);
    try {
      const response = await fetch('/api/gemini/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songs: [{
            name: "Enter Sandman",
            artists: [{ name: "Metallica" }]
          }],
          userId: "test-user" // Mock user ID for testing
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      setRecommendationsGemini(data);
    } catch (err) {
      setErrorGemini(err.message);
      console.error('Recommendation error:', err);
    } finally {
      setLoadingGemini(false);
    }
  };

  return (
    <div className="card">
      <h1>Song Rank</h1>
      <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #ddd' }}>
        <h2>Gemini AI Test</h2>
        <button 
          onClick={getMetallicaRecommendations}
          disabled={loadingGemini}
        >
          {loadingGemini ? 'Loading...' : 'Get Metallica Recommendations'}
        </button>
        
        {errorGemini && <p style={{ color: 'red' }}>{errorGemini}</p>}
        
        {recommendationsGemini && (
          <div style={{ 
            marginTop: '20px',
            textAlign: 'left',
            whiteSpace: 'pre-wrap'
          }}>
            <h3>Recommendations:</h3>
            <pre>{JSON.stringify(recommendationsGemini, null, 2)}</pre>
          </div>
        )}
      </div>
      <h1>Spotify Artist Info</h1>
        {artist ? (
          <>
            <h2>{artist.name}</h2>
            <img src={artist.images[0].url} alt={artist.name} width={300} />
            <p>Genres: {artist.genres.join(', ')}</p>
            <p>Followers: {artist.followers.total.toLocaleString()}</p>
            <p>
              <a href={artist.external_urls.spotify} target="_blank" rel="noreferrer">
                Open in Spotify
              </a>
            </p>

            <div style={{ marginTop: '20px' }}>
              <button onClick={fetchLyrics} disabled={loadingLyrics}>
                {loadingLyrics ? 'Loading...' : 'Get "Enter Sandman" Lyrics'}
              </button>
              {lyrics && (
                <div style={{ 
                  whiteSpace: 'pre-line', 
                  marginTop: '10px',
                  textAlign: 'left',
                  padding: '10px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '5px'
                }}>
                  <h3>Enter Sandman Lyrics:</h3>
                  {lyrics}
                </div>
              )}
            </div>
          </>
        ) : (
          <p>Loading artist info...</p>
        )}
    </div>
  )
}

export default App
