import { useState, useEffect } from 'react';
import ListCard from '../components/ListCard';

const Explore = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchPublishedLists();
    checkAdminStatus();
  }, []);

  const fetchPublishedLists = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/lists/explore');
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
      const response = await fetch('/api/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken: token })
      });
      const data = await response.json();
      setIsAdmin(data.user?.role === 'admin');
    } catch (err) {
      console.error('Error checking admin status:', err);
    }
  };

  const deleteList = async (listId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/lists/${listId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setLists(lists.filter(list => list._id !== listId));
    } catch (err) {
      console.error('Error deleting list:', err);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Explore Lists</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : lists.length === 0 ? (
        <p>No published lists yet.</p>
      ) : (
        <div>
          {lists.map(list => (
            <ListCard 
              key={list._id} 
              list={list} 
              isOwner={false}
              onDelete={isAdmin ? deleteList : null}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;