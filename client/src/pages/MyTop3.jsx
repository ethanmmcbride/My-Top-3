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
      const response = await fetch('http://localhost:3001/api/lists', {
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

  const addSongToList = async (song) => {
    if (!list) return;
    
    try {
      const response = await fetch(
        'http://localhost:3001/api/lists/songs',
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
      const response = await fetch('http://localhost:3001/api/lists/songs', {
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
        'http://localhost:3001/api/lists/publish',
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
              <h3>{list.title}</h3>
              <p>{list.description}</p>
              
              <div style={{ marginTop: '20px' }}>
                <h3>Your Top 3:</h3>
                {list.songs?.length === 0 ? (
                  <p>No songs in your list yet. Add some below!</p>
                ) : (
                  list.songs?.map((song, index) => (
                    <SongCard 
                      key={index}
                      song={song}
                      onRemove={removeSongFromList}
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
                      const res = await fetch('http://localhost:3001/api/lists/unpublish', {
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
          <SongSearch onAddSong={addSongToList} />
          {list?.songs?.length >= 3 && (
            <p style={{ color: 'red' }}>You've reached the maximum of 3 songs!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyList;