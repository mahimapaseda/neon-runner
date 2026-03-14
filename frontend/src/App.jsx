import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Game from './pages/Game';
import useAuthStore from './store/authStore';
import useSettingsStore from './store/settingsStore';
import audioManager from './services/audioManager';
import SettingsModal from './components/ui/SettingsModal';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Unified Global Widgets
const GlobalHUD = ({ onOpenSettings, isFullscreen, onToggleFullscreen }) => (
  <div style={{
    position: 'fixed', top: '20px', right: '20px', zIndex: 999,
    display: 'flex', gap: '10px'
  }}>
    <button 
      onClick={onToggleFullscreen}
      className="btn-secondary"
      style={{ padding: '8px 12px', fontSize: '0.7rem', background: 'rgba(0,0,0,0.6)' }}
    >
      {isFullscreen ? 'COLLAPSE' : 'EXPAND'}
    </button>
    <button 
      onClick={onOpenSettings}
      className="btn-primary"
      style={{ padding: '8px 16px', fontSize: '0.7rem' }}
    >
      ⚙️ SYS
    </button>
  </div>
);

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const crtFilter = useSettingsStore(state => state.crtFilter);

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

  // Handle CRT filter global class
  React.useEffect(() => {
    if (crtFilter) {
      document.body.classList.remove('no-scanlines');
    } else {
      document.body.classList.add('no-scanlines');
    }
  }, [crtFilter]);

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
      <GlobalHUD 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        isFullscreen={isFullscreen} 
        onToggleFullscreen={toggleFullscreen} 
      />
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
