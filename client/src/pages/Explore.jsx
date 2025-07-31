import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import ListCard from '../components/ListCard';
const BASE_URL = `https://final-project-song-rank.onrender.com`;
const socket = io(BASE_URL);


const Explore = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchPublishedLists();
    checkAdminStatus();
  }, []);

  useEffect(() => {
    socket.on('listUpdated', (data) => {
      console.log('List update received:', data);
      fetchPublishedLists();
    });

    return () => {
      socket.off('listUpdated');
    };
  }, []);

  const fetchPublishedLists = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/lists/explore`);
      const data = await response.json();
      setLists(data);
    } catch (err) {
      console.error('Error fetching lists:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkAdminStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await fetch(`${BASE_URL}/api/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken: token })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setIsAdmin(data.user?.role === 'admin');
    } catch (err) {
      console.error('Error checking admin status:', err);
    }
  };

  const unpublishList = async (listId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/lists/admin/unpublish/${listId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ idToken: token })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to unpublish list');
      }

      const updated = await response.json();
      // Remove from explore list view
      setLists(prev => prev.filter(list => list._id !== updated._id));
      alert('List unpublished successfully');
    } catch (err) {
      console.error('Unpublish failed:', err);
      alert(err.message);
    }
  };

  const deleteList = async (listId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${BASE_URL}/api/lists/${listId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ idToken: token })
      });
      setLists(lists.filter(list => list._id !== listId));
    } catch (err) {
      console.error('Error deleting list:', err);
      alert('Failed to delete list');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Explore Published Lists</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : lists.length === 0 ? (
        <p>No published lists yet. Be the first to publish your Top 3!</p>
      ) : (
        <div>
          {lists.map(list => (
            <ListCard 
              key={list._id} 
              list={list} 
              // onDelete={isAdmin ? deleteList : null}
              isAdmin={isAdmin}
              onUnpublish={isAdmin ? unpublishList : null}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;