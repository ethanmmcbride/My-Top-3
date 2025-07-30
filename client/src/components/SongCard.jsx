const SongCard = ({ song, onRemove, onShowLyrics }) => {
  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '10px', 
      margin: '10px 0',
      display: 'flex',
      alignItems: 'center'
    }}>
      {song.imageUrl && (
        <img 
          src={song.imageUrl} 
          alt={song.name} 
          style={{ width: '64px', height: '64px', marginRight: '10px' }} 
        />
      )}
      <div>
        <h4>{song.name}</h4>
        <p>{song.artist}</p>
        {song.previewUrl && (
          <audio controls style={{ width: '200px', height: '30px' }}>
            <source src={song.previewUrl} type="audio/mpeg" />
          </audio>
        )}

      <div style={{ marginTop: '5px' }}>
          {onShowLyrics && (
            <button onClick={() => onShowLyrics(song)}>Lyrics</button>
          )}
      {onRemove && (
        <button 
          onClick={() => onRemove(song)}
          style={{ marginLeft: 'auto' }}
        >
          Remove
        </button>
      )}
    </div>
    </div>
    </div>
  );
};

export default SongCard;