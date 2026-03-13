import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Game from './pages/Game';
import useAuthStore from './store/authStore';
import audioManager from './services/audioManager';
import SettingsModal from './components/ui/SettingsModal';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// A small global floating widget to open settings
const SettingsWidget = ({ onOpen }) => (
  <button 
    onClick={onOpen}
    style={{
      position: 'fixed', top: '15px', right: '15px', zIndex: 999,
      background: 'rgba(0,0,0,0.5)', border: '1px solid var(--primary)',
      color: 'var(--primary)', padding: '10px 15px', borderRadius: '4px',
      cursor: 'pointer', fontFamily: 'Fira Code', boxShadow: '0 0 10px rgba(0,240,255,0.2)'
    }}
  >
    ⚙️ SYS
  </button>
);

const FullscreenWidget = ({ isFullscreen, onToggle }) => (
  <button 
    onClick={onToggle}
    style={{
      position: 'fixed', top: '15px', right: '110px', zIndex: 999,
      background: 'rgba(0,0,0,0.5)', border: '1px solid var(--primary)',
      color: 'var(--primary)', padding: '10px 15px', borderRadius: '4px',
      cursor: 'pointer', fontFamily: 'Fira Code', boxShadow: '0 0 10px rgba(0,240,255,0.2)'
    }}
  >
    {isFullscreen ? 'v EXPAND v' : '^ EXPAND ^'}
  </button>
);

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false));
      }
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Initialize audio context on first click anywhere in the app
  React.useEffect(() => {
    const handleFirstInteraction = () => {
      if (!audioManager.initialized) {
        audioManager.init();
        audioManager.startBGM();
      } else if (!audioManager.bgmPlaying) {
        audioManager.startBGM();
      }
      document.removeEventListener('click', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    return () => document.removeEventListener('click', handleFirstInteraction);
  }, []);

  return (
    <Router>
      <FullscreenWidget isFullscreen={isFullscreen} onToggle={toggleFullscreen} />
      <SettingsWidget onOpen={() => setIsSettingsOpen(true)} />
      {isSettingsOpen && (
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      )}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game"
          element={
            <ProtectedRoute>
              <Game />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
