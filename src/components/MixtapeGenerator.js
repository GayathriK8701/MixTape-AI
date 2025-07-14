import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import MusicPlayer from './MusicPlayer';
import SongQueue from './SongQueue';
import logo from '../logo.png';

const Container = styled.div`
  min-height: 100vh;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const LogoText = styled.span`
  font-size: 2rem;
  font-weight: 800;
  color: #667eea;
  margin: 0;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const Username = styled.span`
  color: #333;
  font-weight: 600;
`;

const LogoutButton = styled.button`
  background: #e74c3c;
  color: white;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.2s ease;
  
  &:hover {
    background: #c0392b;
  }
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const GeneratorSection = styled.div`
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

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 20px;
`;

const PromptForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  
  &:focus {
    border-color: #667eea;
    outline: none;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const AnalysisSection = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  display: ${props => props.show ? 'block' : 'none'};
`;

const AnalysisTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
`;

const AnalysisGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
`;

const AnalysisItem = styled.div`
  background: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const AnalysisLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
`;

const AnalysisValue = styled.div`
  font-weight: 600;
  color: #333;
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  background: #fdf2f2;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 0.9rem;
`;

const LoadingMessage = styled.div`
  color: #667eea;
  background: #f0f4ff;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  text-align: center;
  font-weight: 600;
`;

function MixtapeGenerator({
  currentSong,
  currentSongIndex,
  setCurrentSongIndex,
  mixtapeQueue,
  setMixtapeQueue,
  analysis,
  setAnalysis,
  setIsPlaying
}) {
  const { user, logout } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [spotifyResults, setSpotifyResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load user's mixtape queue on component mount only if user is authenticated
  useEffect(() => {
    if (user) {
      loadMixtapeQueue();
    }
  }, [user]);

  const loadMixtapeQueue = async () => {
    if (!user) return; // Don't load if not authenticated
    console.log('Auth header (queue):', axios.defaults.headers.common['Authorization']);
    try {
      const response = await axios.get('http://localhost:5050/api/mixtape_queue');
      setMixtapeQueue(response.data.queue);
    } catch (error) {
      console.error('Error loading mixtape queue:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || !user) return; // Don't submit if not authenticated

    setLoading(true);
    setError('');
    setAnalysis(null);
    setSpotifyResults([]);

    console.log('Auth header (generate):', axios.defaults.headers.common['Authorization']);
    try {
      const response = await axios.post('http://localhost:5050/api/generate', {
        prompt: prompt
      });

      setAnalysis(response.data.analysis);
      setSpotifyResults(response.data.spotify_results);
    } catch (error) {
      console.error('Mixtape generate error:', error, error.response);
      setError(
        error.response?.data?.error ||
        error.message ||
        'Failed to generate mixtape'
      );
    } finally {
      setLoading(false);
    }
  };

  const addSongToQueue = async (song) => {
    if (!user) return; // Don't add if not authenticated
    console.log('Auth header (add song):', axios.defaults.headers.common['Authorization']);
    try {
      const response = await axios.post('http://localhost:5050/api/add_song', song);
      if (response.data.success) {
        await loadMixtapeQueue();
      }
    } catch (error) {
      console.error('Error adding song:', error);
    }
  };

  const removeSongFromQueue = async (spotifyTrackId) => {
    if (!user) return; // Don't remove if not authenticated
    console.log('Auth header (remove song):', axios.defaults.headers.common['Authorization']);
    try {
      const response = await axios.post('http://localhost:5050/api/remove_song', {
        spotify_track_id: spotifyTrackId
      });
      if (response.data.success) {
        await loadMixtapeQueue();
      }
    } catch (error) {
      console.error('Error removing song:', error);
    }
  };

  const generatePlaylistFromSongs = async () => {
    if (!user) return; // Don't generate if not authenticated
    if (mixtapeQueue.length < 4) {
      setError('You need at least 4 songs to generate a playlist');
      return;
    }

    setLoading(true);
    setError('');

    console.log('Auth header (generate playlist):', axios.defaults.headers.common['Authorization']);
    try {
      const response = await axios.post('http://localhost:5050/api/generate_playlist_from_songs', {
        songs: mixtapeQueue
      });

      if (response.data.added) {
        await loadMixtapeQueue();
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to generate playlist');
    } finally {
      setLoading(false);
    }
  };

  // Show login message if user is not authenticated
  if (!user) {
    return (
      <Container>
        <Header>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <img src={logo} alt='Mixtape AI Logo' style={{height: 48, marginRight: 12}} />
            <LogoText>Mixtape AI</LogoText>
          </div>
        </Header>
        <MainContent>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Please log in to use Mixtape AI</h2>
            <p>You need to be authenticated to generate mixtapes and manage your queue.</p>
          </div>
        </MainContent>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <img src={logo} alt='Mixtape AI Logo' style={{height: 48, marginRight: 12}} />
          <LogoText>Mixtape AI</LogoText>
        </div>
        <UserInfo>
          <Username>Welcome, {user?.username || user?.email}</Username>
          <LogoutButton onClick={logout}>Logout</LogoutButton>
        </UserInfo>
      </Header>

      <MainContent>
        <GeneratorSection>
          <SectionTitle style={{textAlign: 'center'}}>Generate Your Mixtape</SectionTitle>
          
          <PromptForm onSubmit={handleSubmit}>
            <InputGroup>
              <Label htmlFor="prompt">Describe your perfect playlist</Label>
              <Input
                id="prompt"
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Chill pop songs for a rainy day, upbeat workout music, relaxing jazz for studying"
                required
              />
            </InputGroup>
            
            <Button type="submit" disabled={loading}>
              {loading ? 'Generating...' : 'Generate Mixtape'}
            </Button>
          </PromptForm>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {loading && <LoadingMessage>🎵 AI is analyzing your request and finding the perfect songs...</LoadingMessage>}

          {analysis && (
            <AnalysisSection show={true}>
              <AnalysisTitle>AI Analysis</AnalysisTitle>
              <AnalysisGrid>
                <AnalysisItem>
                  <AnalysisLabel>Mood</AnalysisLabel>
                  <AnalysisValue>{analysis.mood}</AnalysisValue>
                </AnalysisItem>
                <AnalysisItem>
                  <AnalysisLabel>Genre</AnalysisLabel>
                  <AnalysisValue>{analysis.genre}</AnalysisValue>
                </AnalysisItem>
                <AnalysisItem>
                  <AnalysisLabel>Language</AnalysisLabel>
                  <AnalysisValue>{analysis.language}</AnalysisValue>
                </AnalysisItem>
                <AnalysisItem>
                  <AnalysisLabel>Keywords</AnalysisLabel>
                  <AnalysisValue>{analysis.keywords?.join(', ')}</AnalysisValue>
                </AnalysisItem>
              </AnalysisGrid>
            </AnalysisSection>
          )}

          {spotifyResults.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <SectionTitle>Recommended Songs</SectionTitle>
              {spotifyResults.map((song, index) => (
                <SongCardComponent key={index} song={song} onAdd={addSongToQueue} />
              ))}
            </div>
          )}
        </GeneratorSection>

        <div>
          <MusicPlayer 
            songs={mixtapeQueue}
            currentIndex={currentSongIndex}
            onIndexChange={setCurrentSongIndex}
            onPlayingStateChange={(playingState) => {
              console.log('🎵 MixtapeGenerator: onPlayingStateChange called with:', playingState);
              setIsPlaying(playingState);
            }}
          />
          
          <SongQueue 
            songs={mixtapeQueue}
            onRemove={removeSongFromQueue}
            onPlay={setCurrentSongIndex}
            onGeneratePlaylist={generatePlaylistFromSongs}
          />
        </div>
      </MainContent>
    </Container>
  );
}

// Song Card Component
const SongCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SongInfo = styled.div`
  flex: 1;
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

const AddButton = styled.button`
  background: #27ae60;
  color: white;
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.2s ease;
  
  &:hover {
    background: #219a52;
  }
`;

function SongCardComponent({ song, onAdd }) {
  return (
    <SongCard>
      <SongInfo>
        <SongTitle>{song.title}</SongTitle>
        <SongArtist>{song.artist}</SongArtist>
      </SongInfo>
      <AddButton onClick={() => onAdd(song)}>
        Add to Queue
      </AddButton>
    </SongCard>
  );
}

export default MixtapeGenerator; 