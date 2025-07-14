import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const PlayerContainer = styled.div`
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
  margin-bottom: 20px;
  &:hover, &:focus {
    transform: scale(1.045) translateY(-3px);
    box-shadow:
      0 12px 48px 0 rgba(118,75,162,0.22),
      0 4px 16px 0 rgba(102,126,234,0.18);
    border-color: #764ba2;
    background: rgba(255,255,255,0.38);
  }
`;

const PlayerTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
`;

const NowPlaying = styled.div`
  text-align: center;
  margin-bottom: 20px;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
  font-weight: 600;
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
`;

const ControlButton = styled.button`
  background: ${props => props.primary ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8f9fa'};
  color: ${props => props.primary ? 'white' : '#333'};
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
  border: 2px solid ${props => props.primary ? 'transparent' : '#e1e5e9'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const AudioPlayer = styled.audio`
  width: 100%;
  margin-bottom: 15px;
`;

const SpotifyEmbed = styled.iframe`
  width: 100%;
  height: 80px;
  border-radius: 10px;
  border: none;
  margin-bottom: 15px;
`;

const NoPreviewMessage = styled.div`
  text-align: center;
  color: #e74c3c;
  background: #fdf2f2;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 15px;
  font-weight: 600;
`;

const ProgressContainer = styled.div`
  width: 100%;
  background: #e1e5e9;
  border-radius: 10px;
  height: 8px;
  margin-bottom: 15px;
  overflow: hidden;
`;

const ProgressBar = styled.div`
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const SongInfo = styled.div`
  text-align: center;
  margin-bottom: 15px;
`;

const SongTitle = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 5px;
`;

const SongArtist = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const AlbumArtCard = styled.img`
  width: 180px;
  height: 180px;
  border-radius: 20px;
  margin: 0 auto 20px;
  display: block;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25), 0 1.5px 6px rgba(118,75,162,0.10);
  border: 2.5px solid #f3f3fa;
  transition: transform 0.18s cubic-bezier(0.4,0.2,0.2,1), box-shadow 0.18s cubic-bezier(0.4,0.2,0.2,1);
  cursor: pointer;
  &:hover {
    transform: scale(1.045);
    box-shadow: 0 16px 48px rgba(118,75,162,0.22), 0 2.5px 12px rgba(102,126,234,0.13);
    border-color: #764ba2;
  }
`;

function MusicPlayer({ songs, currentIndex, onIndexChange, onPlayingStateChange }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const currentSong = songs[currentIndex];

  useEffect(() => {
    if (currentSong) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [currentSong]);

  const handlePlay = () => {
    console.log('🎵 Play button clicked!');
    if (audioRef.current) {
      console.log('🎵 Audio element found, attempting to play...');
      audioRef.current.play().then(() => {
        console.log('🎵 Audio started playing successfully!');
        setIsPlaying(true);
        onPlayingStateChange?.(true);
        console.log('🎵 Playing state set to TRUE');
      }).catch((error) => {
        console.error('❌ Failed to play audio:', error);
      });
    } else {
      console.log('❌ No audio element found');
    }
  };

  const handlePause = () => {
    console.log('⏸ Pause button clicked!');
    if (audioRef.current) {
      console.log('⏸ Audio element found, pausing...');
      audioRef.current.pause();
      setIsPlaying(false);
      onPlayingStateChange?.(false);
      console.log('⏸ Playing state set to FALSE');
    } else {
      console.log('❌ No audio element found for pause');
    }
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % songs.length;
    onIndexChange(nextIndex);
  };

  const handlePrevious = () => {
    const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
    onIndexChange(prevIndex);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    handleNext();
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const seekTime = (clickX / width) * duration;
    
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  if (!currentSong) {
    return (
      <PlayerContainer>
        <PlayerTitle>🎵 Music Player</PlayerTitle>
        <NowPlaying>No songs in your mixtape yet</NowPlaying>
        <Controls>
          <ControlButton disabled>⏮ Previous</ControlButton>
          <ControlButton disabled>⏸ Play</ControlButton>
          <ControlButton disabled>⏭ Next</ControlButton>
        </Controls>
      </PlayerContainer>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <PlayerContainer>
      <PlayerTitle>🎵 Music Player</PlayerTitle>
      
      <NowPlaying>
        Now Playing: {currentSong.title} by {currentSong.artist}
      </NowPlaying>
{/* 
      <SongInfo>
        <SongTitle>{currentSong.title}</SongTitle>
        <SongArtist>{currentSong.artist}</SongArtist>
      </SongInfo> */}

      {/* Album Art Display (with card shadow and interactivity) */}
      {isPlaying && currentSong.album_art_url && (
        <AlbumArtCard
          src={currentSong.album_art_url}
          alt="Album Art"
          tabIndex={0}
        />
      )}

      {currentSong.preview_url && currentSong.preview_url !== 'null' ? (
        <>
          <AudioPlayer
            ref={audioRef}
            src={currentSong.preview_url}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            controls
          />
          
          <ProgressContainer onClick={handleSeek}>
            <ProgressBar progress={progress} />
          </ProgressContainer>
          
          <Controls>
            <ControlButton onClick={handlePrevious} disabled={songs.length <= 1}>
              ⏮ Previous
            </ControlButton>
            <ControlButton 
              primary 
              onClick={isPlaying ? handlePause : handlePlay}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </ControlButton>
            <ControlButton onClick={handleNext} disabled={songs.length <= 1}>
              ⏭ Next
            </ControlButton>
          </Controls>
        </>
      ) : (
        <>
          {/* <NoPreviewMessage>
            ⚠️ No preview available for this song
          </NoPreviewMessage> */}
          
          <SpotifyEmbed
            src={`https://open.spotify.com/embed/track/${currentSong.spotify_track_id}?utm_source=generator`}
            allow="encrypted-media"
          />
          
          <Controls>
            <ControlButton onClick={handlePrevious} disabled={songs.length <= 1}>
              ⏮ Previous
            </ControlButton>
            {/* <ControlButton disabled>
              ▶ Play on Spotify
            </ControlButton> */}
            <ControlButton onClick={handleNext} disabled={songs.length <= 1}>
              ⏭ Next
            </ControlButton>
          </Controls>
        </>
      )}
    </PlayerContainer>
  );
}

export default MusicPlayer; 