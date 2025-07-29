import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SongSearch from '../components/SongSearch';
import ListCard from '../components/ListCard';

const MyLists = () => {
  const [lists, setLists] = useState([]);
  const [currentList, setCurrentList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchMyLists();
  }, [token, navigate]);

  const fetchMyLists = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/lists', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch lists');
      const data = await response.json();
      setLists(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

const createNewList = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/lists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        idToken: token,
        title: 'New Playlist',
        description: ''
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Failed to create list');
    }

    const newList = await response.json();
    setLists([...lists, newList]);
    setCurrentList(newList);
  } catch (err) {
    console.error('Error creating list:', err);
    setError(err.message);
  }
};


  const addSongToList = async (song) => {
    if (!currentList) return;
    
    try {
      const response = await fetch(
        `http://localhost:3001/api/lists/${currentList._id}/songs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({idToken: token, song})
        }
      );
      const updatedList = await response.json();
      setCurrentList(updatedList);
      setLists(lists.map(list => 
        list._id === updatedList._id ? updatedList : list
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const publishList = async (listId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/lists/${listId}/publish`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ idToken: token })
        }
      );
      const updatedList = await response.json();
      setLists(lists.map(list => 
        list._id === updatedList._id ? updatedList : list
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>My Lists</h1>
      
      <button 
        onClick={createNewList}
        style={{ 
          marginBottom: '20px',
          padding: '10px 15px',
          backgroundColor: '#1DB954',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Create New List
      </button>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h2>Your Lists</h2>
          {lists.length === 0 ? (
            <p>You don't have any lists yet.</p>
          ) : (
            <div>
              {lists.map(list => (
                <div 
                  key={list._id}
                  onClick={() => setCurrentList(list)}
                  style={{ 
                    padding: '15px',
                    marginBottom: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: currentList?._id === list._id ? '#f5f5f5' : 'white'
                  }}
                >
                  <h3>{list.title}</h3>
                  <p>{list.songs?.length || 0} songs</p>
                  {!list.isPublished && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        publishList(list._id);
                      }}
                      style={{
                        marginRight: '10px',
                        padding: '5px 10px',
                        backgroundColor: '#1DB954',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Publish
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {currentList && (
          <div style={{ flex: 2 }}>
            <h2>{currentList.title}</h2>
            <p>{currentList.description}</p>
            
            <SongSearch onAddSong={addSongToList} />
            
            <div style={{ marginTop: '20px' }}>
              <h3>Songs in this list:</h3>
              {currentList.songs?.length === 0 ? (
                <p>No songs in this list yet.</p>
              ) : (
                currentList.songs?.map((song, index) => (
                  <div 
                    key={index}
                    style={{
                      padding: '10px',
                      marginBottom: '10px',
                      border: '1px solid #eee',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {song.imageUrl && (
                      <img 
                        src={song.imageUrl} 
                        alt={song.name}
                        style={{ 
                          width: '50px', 
                          height: '50px',
                          marginRight: '10px',
                          borderRadius: '4px'
                        }}
                      />
                    )}
                    <div>
                      <strong>{song.name}</strong>
                      <p>{song.artist}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLists;