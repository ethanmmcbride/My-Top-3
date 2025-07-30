import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SongSearch from '../components/SongSearch';
import SongCard from '../components/SongCard';

const MyList = () => {
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [lyrics, setLyrics] = useState('');
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [lyricsError, setLyricsError] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState('');

  const BASE_URL = `https://final-project-song-rank.onrender.com`;

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchMyList();
  }, [token, navigate]);

  const fetchMyList = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/api/lists`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setList(data);
    } catch (err) {
      console.error('Fetch list error:', err);
      setError(err.message || 'Failed to fetch list');
      alert(err.message || 'Failed to fetch list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLyrics = async (song) => {
    setLyrics('');
    setLyricsError('');
    setLyricsLoading(true);

    try {
    //   const sanitize = (str) => {
    //     return str
    //       .toLowerCase()
    //       .replace(/ *\([^)]*\) */g, '') // Remove things in parentheses
    //       .replace(/[^a-z0-9 ]/gi, '')   // Remove special chars
    //       .trim();
    //   };
    //   const artistSafe = sanitize(song.artist);
    //   const titleSafe = sanitize(song.name);
      const res = await fetch(`/api/lyrics/${encodeURIComponent(song.artist)}/${encodeURIComponent(song.name)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch lyrics');
      }

      setLyrics(data.lyrics);
    } catch (err) {
      setLyricsError(err.message);
    } finally {
      setLyricsLoading(false);
    }
  };

  const getRecommendations = async () => {
    if (!list || !list.songs || list.songs.length === 0) {
      alert("You need at least one song in your list.");
      return;
    }

    setLoadingRecommendations(true);
    setRecommendationError('');
    setRecommendations(null);

    try {
      const response = await fetch('/api/gemini/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          songs: list.songs.map(song => ({
            name: song.name,
            artists: [{ name: song.artist }]
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      console.error('AI Recommendation error:', err);
      setRecommendationError(err.message || 'Something went wrong');
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const addSongToList = async (song) => {
    if (!list) return;
    
    try {
      const response = await fetch(
        `${BASE_URL}/api/lists/songs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({idToken: token, song})
        }
      );
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to add song');
      }
      
      const updatedList = await response.json();
      setList(updatedList);
    } catch (err) {
      setError(err.message);
      alert(err.message);
    }
  };

  const removeSongFromList = async (song) => {
    try {
      const response = await fetch(`${BASE_URL}/api/lists/songs`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ idToken: token, songId: song.spotifyId })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to remove song');
      }

      const updatedList = await response.json();
      setList(updatedList);
    } catch (err) {
      setError(err.message);
      alert(err.message);
    }
  };

  const publishList = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/lists/publish`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ idToken: token })
        }
      );
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to publish list');
      }
      
      const updatedList = await response.json();
      setList(updatedList);
      alert('Your list has been published and is now visible in the Explore page!');
    } catch (err) {
      setError(err.message);
      alert(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>My Top 3 Songs</h1>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h2>Current List</h2>
          {list ? (
            <div>
              {/* <h3>{list.title}</h3>
              <p>{list.description}</p> */}
              
              <div style={{ marginTop: '20px' }}>
                {/* <h3> My Top 3 </h3> */}
                {list.songs?.length === 0 ? (
                  <p>No songs in your list yet. Add some below!</p>
                ) : (
                  list.songs?.map((song, index) => (
                    <SongCard 
                      key={index}
                      song={song}
                      onRemove={removeSongFromList}
                      onShowLyrics={fetchLyrics}
                    />
                  ))
                )}
              </div>

              {list.songs?.length > 0 && !list.isPublished && (
                <button
                  onClick={publishList}
                  style={{
                    marginTop: '20px',
                    padding: '10px 15px',
                    backgroundColor: '#1DB954',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Publish My List
                </button>
              )}

              {list.isPublished && (
                // <p style={{ color: 'green', marginTop: '20px' }}>
                //   Your list is published and visible in the Explore page!
                // </p>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch( `${BASE_URL}/api/lists/unpublish`, {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ idToken: token })
                      });

                      if (!res.ok) {
                        const err = await res.json();
                        throw new Error(err.message || 'Failed to unpublish');
                      }

                      const updated = await res.json();
                      setList(updated);
                      alert('Your list has been unpublished.');
                    } catch (err) {
                      alert(err.message);
                    }
                  }}
                  style={{
                    marginTop: '10px',
                    backgroundColor: '#888',
                    color: 'white',
                    padding: '10px 15px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Unpublish My List
                </button>
              )}
            </div>
          ) : (
            <p>Loading your list...</p>
          )}
          
        </div>

        <div style={{ flex: 1 }}>
          <h2>Add Songs</h2>
          <SongSearch 
            onAddSong={(song) => {
              if (list?.songs?.length >= 3) {
                alert("You can only add 3 songs to your list.");
                return;
              }
              addSongToList(song);
            }}
          />
          {list?.songs?.length >= 3 && (
            <p style={{ color: 'red' }}>You've reached the maximum of 3 songs!</p>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <button
            onClick={getRecommendations}
            disabled={loadingRecommendations || !list?.songs.length }
            style={{
              marginTop: '20px',
              padding: '10px 15px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {loadingRecommendations ? 'Loading...' : 'Get AI Recommendations (based off of top 3!)'}
          </button>
          {recommendationError && (
            <p style={{ color: 'red', marginTop: '10px' }}>{recommendationError}</p>
          )}
          {recommendations && (
            <div style={{ marginTop: '20px', textAlign: 'left' }}>
              <h3>AI Recommendations Based on Top 3</h3>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{recommendations.response}</pre>
              {/* <ul>
                {recommendations.map((rec, index) => (
                  <li key={index} style={{ marginBottom: '10px' }}>
                    <strong>{rec.song}</strong> by {rec.artist}<br />
                    <em>{rec.reason}</em>
                  </li>
                )
                )}
              </ul> */}
            </div>
          )}
        </div>
      </div>
      
      {lyricsLoading && <p>Loading lyrics...</p>}
      {lyricsError && <p style={{ color: 'red' }}>{lyricsError}</p>}
      {lyrics && (
        <div style={{
          marginTop: '20px',
          textAlign: 'left',
          padding: '10px',
          backgroundColor: '#f5f5f5',
          borderRadius: '5px'
        }}>
          <h3>Lyrics:</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{lyrics}</pre>
        </div>
      )}
    </div>
  );
};

export default MyList;