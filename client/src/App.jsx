import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [artist, setArtist] = useState(null);
  const [lyrics, setLyrics] = useState(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);

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

  return (
    <div className="card">
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
