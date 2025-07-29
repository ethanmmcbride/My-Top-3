import { useState } from 'react';

const SongSearch = ({ onAddSong }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchSongs = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data.tracks.items);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', marginBottom: '10px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for songs..."
          style={{ flex: 1, padding: '8px' }}
        />
        <button 
          onClick={searchSongs}
          disabled={loading}
          style={{ marginLeft: '10px', padding: '8px 15px' }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {results.length > 0 && (
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {results.map((track) => (
            <div 
              key={track.id} 
              style={{ 
                padding: '10px', 
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <strong>{track.name}</strong> - {track.artists.map(a => a.name).join(', ')}
              </div>
              <button 
                onClick={() => onAddSong({
                  spotifyId: track.id,
                  name: track.name,
                  artist: track.artists.map(a => a.name).join(', '),
                  album: track.album.name,
                  imageUrl: track.album.images[0]?.url,
                  previewUrl: track.preview_url
                })}
                style={{ marginLeft: '10px' }}
              >
                Add
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SongSearch;