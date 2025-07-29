import SongCard from './SongCard';
const ListCard = ({ list, isOwner = false, onDelete }) => {
  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '15px', 
      margin: '15px 0'
    }}>
      <h3>{list.title}</h3>
      {list.description && <p>{list.description}</p>}
      <p>By: {list.userId?.email || 'Unknown user'}</p>
      
      <div style={{ marginTop: '10px' }}>
        {list.songs.map((song, index) => (
          <SongCard key={index} song={song} />
        ))}
      </div>

      {isOwner && (
        <button 
          onClick={() => onDelete(list._id)}
          style={{ marginTop: '10px', backgroundColor: '#ff4444', color: 'white' }}
        >
          Delete List
        </button>
      )}
    </div>
  );
};

export default ListCard;