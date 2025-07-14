import React, { useState } from 'react';
import styled from 'styled-components';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const QueueContainer = styled.div`
  background: rgba(255,255,255,0.32);
  border-radius: 20px;
  box-shadow:
    0 8px 32px 0 rgba(31, 38, 135, 0.18),
    0 1.5px 6px 0 rgba(118,75,162,0.10),
    0 0.5px 1.5px 0 rgba(0,0,0,0.08);
  border: 1.5px solid rgba(255,255,255,0.25);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition:
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.32s;
  will-change: transform, box-shadow, border-color;
  cursor: pointer;
  padding: 30px;
  &:hover, &:focus {
    transform: scale(1.045) translateY(-3px);
    box-shadow:
      0 12px 48px 0 rgba(118,75,162,0.22),
      0 4px 16px 0 rgba(102,126,234,0.18);
    border-color: #764ba2;
    background: rgba(255,255,255,0.38);
  }
`;

const QueueTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
`;

const QueueList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
`;

const QueueItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: white;
  border-radius: 10px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const SongInfo = styled.div`
  flex: 1;
  margin-right: 15px;
`;

const SongTitle = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const SongArtist = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const QueueActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: ${props => {
    if (props.danger) return '';
    if (props.play) return '#27ae60';
    return '#f8f9fa';
  }};
  color: ${props => props.danger || props.play ? 'white' : '#333'};
  padding: 8px 12px;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
  border: 2px solid ${props => props.danger || props.play ? 'transparent' : '#e1e5e9'};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
`;

const EmptyQueue = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-size: 1.1rem;
`;

const GenerateButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 30px;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: transform 0.2s ease;
  width: 100%;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const QueueStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

function SongQueue({ songs, onRemove, onPlay, onGeneratePlaylist }) {
  const [confirmDelete, setConfirmDelete] = useState({ show: false, song: null });
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePlaySong = (index) => {
    onPlay(index);
  };

  const handleRemoveSong = (song) => {
    setConfirmDelete({ show: true, song });
  };

  const handleConfirmDelete = async () => {
    await onRemove(confirmDelete.song.spotify_track_id);
    setConfirmDelete({ show: false, song: null });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1200);
  };

  const handleCloseModal = () => {
    setConfirmDelete({ show: false, song: null });
  };

  return (
    <QueueContainer>
      <QueueTitle>Your Mixtape Queue</QueueTitle>
      
      {songs.length > 0 && (
        <QueueStats>
          <StatItem>
            <StatValue>{songs.length}</StatValue>
            <StatLabel>Songs</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{songs.length >= 4 ? '✅' : '❌'}</StatValue>
            <StatLabel>Ready for AI</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>🎵</StatValue>
            <StatLabel>Mixtape</StatLabel>
          </StatItem>
        </QueueStats>
      )}
      
      <QueueList>
        {songs.length === 0 ? (
          <EmptyQueue>
            🎵 No songs in your mixtape yet
            <br />
            <small>Add some songs to get started!</small>
          </EmptyQueue>
        ) : (
          songs.map((song, index) => (
            <QueueItem key={song.spotify_track_id}>
              <SongInfo>
                <SongTitle>
                  {index + 1}. {song.title}
                </SongTitle>
                <SongArtist>by {song.artist}</SongArtist>
              </SongInfo>
              
              <QueueActions>
                <ActionButton 
                  play 
                  onClick={() => handlePlaySong(index)}
                  title="Play this song"
                >
                  ▶
                </ActionButton>
                <ActionButton 
                  danger 
                  onClick={() => handleRemoveSong(song)}
                  title="Remove from queue"
                >
                  ❌
                </ActionButton>
              </QueueActions>
            </QueueItem>
          ))
        )}
      </QueueList>
      
      {songs.length >= 4 && (
        <GenerateButton onClick={onGeneratePlaylist}>
          🎵 Generate AI Playlist from Your Songs
        </GenerateButton>
      )}
      
      {songs.length > 0 && songs.length < 4 && (
        <GenerateButton disabled>
          Add {4 - songs.length} more song{songs.length === 3 ? '' : 's'} to generate AI playlist
        </GenerateButton>
      )}
      <Modal show={confirmDelete.show} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <b>{confirmDelete.song?.title}</b>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            No
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(102,126,234,0.18)',
          padding: '32px 48px',
          fontSize: '2.5rem',
          color: '#27ae60',
          zIndex: 9999,
          textAlign: 'center',
        }}>
          ✔️ Song deleted!
        </div>
      )}
    </QueueContainer>
  );
}

export default SongQueue; 