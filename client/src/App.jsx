import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [artist, setArtist] = useState(null);

  useEffect(() => {
    fetch('/api/spotify')
      .then((res) => res.json())
      .then((data) => {
        console.log('Received data:', data);
        setArtist(data);
      })
      .catch((err) => console.error('Error fetching artist:', err));
  }, []);

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
          </>
        ) : (
          <p>Loading artist info...</p>
        )}
    </div>
  )
}

export default App
