import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import MixtapeGenerator from './components/MixtapeGenerator';
import Login from './components/Login';
import Signup from './components/Signup';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FastAverageColor } from 'fast-average-color';
import logo from './logo.png'; // Use the new logo

const moodColors = {
  Energetic: '#ffb347',
  Chill: '#6dd5ed',
  Sad: '#b993d6',
  Happy: '#f7971e',
  Dark: '#232526',
  Pop: '#ff6a88',
  Rock: '#232526',
  Jazz: '#43cea2',
  Classical: '#f8ffae',
  Default: '#764ba2',
};

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    min-height: 100vh;
    color: #333;
    background: ${({ bgGradient }) => bgGradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
    transition: background 1.2s cubic-bezier(0.22, 1, 0.36, 1);
    position: relative;
    overflow-x: hidden;
  }

  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${({ bgGradient }) => bgGradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
    z-index: -1;
    animation: ${({ isPlaying }) => isPlaying ? 'pulse 0.4s ease-in-out infinite' : 'none'};
    transform: scale(${({ isPlaying }) => isPlaying ? 1.1 : 1});
    filter: blur(${({ isPlaying }) => isPlaying ? 3 : 0}px);
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1) rotate(0deg);
    }
    25% {
      transform: scale(1.15) rotate(5deg);
    }
    50% {
      transform: scale(1.25) rotate(0deg);
    }
    75% {
      transform: scale(1.15) rotate(-5deg);
    }
  }

  @keyframes wave {
    0% {
      transform: translateX(-100px) rotate(0deg) scale(0.5);
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    80% {
      opacity: 1;
    }
    100% {
      transform: translateX(calc(100vw + 100px)) rotate(720deg) scale(2);
      opacity: 0;
    }
  }

  body::after {
    content: '';
    position: fixed;
    top: 30%;
    left: -100px;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 50%, transparent 70%);
    border-radius: 50%;
    z-index: -1;
    animation: ${({ isPlaying }) => isPlaying ? 'wave 4s linear infinite' : 'none'};
    animation-delay: ${({ isPlaying }) => isPlaying ? 0.5 : 0}s;
  }

  /* Add a second dancing element using a pseudo-element on html */
  html::before {
    content: '';
    position: fixed;
    bottom: 20%;
    right: -80px;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 60%);
    border-radius: 50%;
    z-index: -1;
    animation: ${({ isPlaying }) => isPlaying ? 'wave 6s linear infinite reverse' : 'none'};
    animation-delay: ${({ isPlaying }) => isPlaying ? 2 : 0}s;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
  }

  input {
    outline: none;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes({
  currentSong,
  currentSongIndex,
  setCurrentSongIndex,
  mixtapeQueue,
  setMixtapeQueue,
  analysis,
  setAnalysis,
  setIsPlaying
}) {
  const { user } = useAuth();

  return (
    <AppContainer>
      <Routes>
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <MixtapeGenerator
                currentSong={currentSong}
                currentSongIndex={currentSongIndex}
                setCurrentSongIndex={setCurrentSongIndex}
                mixtapeQueue={mixtapeQueue}
                setMixtapeQueue={setMixtapeQueue}
                analysis={analysis}
                setAnalysis={setAnalysis}
                setIsPlaying={setIsPlaying}
              />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" /> : <Login />} 
        />
        <Route 
          path="/signup" 
          element={user ? <Navigate to="/" /> : <Signup />} 
        />
      </Routes>
    </AppContainer>
  );
}

// Animated dancing spot
const DancingSpot = styled.div`
  position: fixed;
  pointer-events: none;
  z-index: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 70%, transparent 100%);
  opacity: ${({ isPlaying }) => isPlaying ? 1 : 0};
  transition: opacity 0.5s;
  animation: pulseSpot ${({ duration }) => duration}s ease-in-out infinite;
  animation-delay: ${({ delay }) => delay}s;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  top: ${({ top }) => top}%;
  left: ${({ left }) => left}%;
  filter: blur(2px);

  @keyframes pulseSpot {
    0%, 100% { transform: scale(0.7); opacity: 0.7; }
    50% { transform: scale(1.3); opacity: 1; }
  }
`;

function getRandomSpots(count) {
  // Returns an array of spot configs: {top, left, size, duration, delay}
  return Array.from({ length: count }).map(() => ({
    top: Math.random() * 80 + 5, // 5% to 85%
    left: Math.random() * 80 + 5, // 5% to 85%
    size: Math.random() * 80 + 60, // 60px to 140px
    duration: Math.random() * 2 + 1.5, // 1.5s to 3.5s
    delay: Math.random() * 2, // 0s to 2s
  }));
}

function App() {
  const [mixtapeQueue, setMixtapeQueue] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [bgGradient, setBgGradient] = useState('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
  const [isPlaying, setIsPlaying] = useState(false);
  const facRef = useRef(new FastAverageColor());
  const [spots] = useState(() => getRandomSpots(6));

  const currentSong = mixtapeQueue[currentSongIndex];

  // Log when isPlaying changes
  useEffect(() => {
    console.log('🎵 App: isPlaying changed to:', isPlaying);
  }, [isPlaying]);

  // Make the background always dance when a song is selected
  useEffect(() => {
    if (currentSong) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [currentSong]);

  useEffect(() => {
    async function updateBg() {
      let dominant = [102, 126, 234]; // default
      if (currentSong && currentSong.album_art_url) {
        try {
          const img = new window.Image();
          img.crossOrigin = 'Anonymous';
          img.src = currentSong.album_art_url;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          const color = facRef.current.getColor(img).value;
          dominant = color;
        } catch (e) {
          // fallback to default
        }
      }
      // Use AI mood/genre for secondary color
      let mood = analysis?.mood || analysis?.genre || 'Default';
      let moodColor = moodColors[mood] || moodColors.Default;
      
      setBgGradient(
        `linear-gradient(135deg, rgb(${dominant.join(',')}), ${moodColor} 100%)`
      );
    }
    updateBg();
    // eslint-disable-next-line
  }, [currentSong, analysis]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup any resources if needed
    };
  }, []);

  return (
    <AuthProvider>
      <GlobalStyle bgGradient={bgGradient} isPlaying={isPlaying} />
      {/* Render animated spots */}
      {spots.map((spot, i) => (
        <DancingSpot
          key={i}
          isPlaying={isPlaying}
          top={spot.top}
          left={spot.left}
          size={spot.size}
          duration={spot.duration}
          delay={spot.delay}
        />
      ))}
      <Router>
        <AppRoutes
          currentSong={currentSong}
          currentSongIndex={currentSongIndex}
          setCurrentSongIndex={setCurrentSongIndex}
          mixtapeQueue={mixtapeQueue}
          setMixtapeQueue={setMixtapeQueue}
          analysis={analysis}
          setAnalysis={setAnalysis}
          setIsPlaying={setIsPlaying}
        />
      </Router>
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        // background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999
      }}>
        {/* Playing: {isPlaying ? 'YES' : 'NO'}
        <br />
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            background: isPlaying ? '#e74c3c' : '#27ae60',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            marginTop: '5px'
          }}
        >
          {isPlaying ? 'Stop Dancing' : 'Start Dancing'}
        </button> */}
      </div>
    </AuthProvider>
  );
}

export default App;
