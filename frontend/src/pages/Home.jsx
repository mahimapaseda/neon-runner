import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useGameStore from '../store/gameStore';
import { fetchLeaderboard, fetchSuperHeroes, updateProfile } from '../services/apiClient';
import audioManager from '../services/audioManager';

const DecodingText = ({ text, active }) => {
    const [display, setDisplay] = useState(text);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$%&';

    useEffect(() => {
        let iteration = 0;
        let interval = null;

        if (active) {
            interval = setInterval(() => {
                setDisplay(text.split('').map((char, index) => {
                    if (index < iteration) return text[index];
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join(''));

                if (iteration >= text.length) clearInterval(interval);
                iteration += 1 / 3;
            }, 30);
        }

        return () => clearInterval(interval);
    }, [active, text, chars]);

    const displayText = active ? display : text;
    return <span className="decoding-text">{displayText}</span>;
};

const Home = () => {
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logoutStore);
    const loginStore = useAuthStore(state => state.loginStore);
    const { selectedHero, setHero } = useGameStore();
    const navigate = useNavigate();

    const [leaderboard, setLeaderboard] = useState([]);
    const [heroes, setHeroes] = useState([]);
    const [showHeroes, setShowHeroes] = useState(false);
    const [loadingHeroes, setLoadingHeroes] = useState(false);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [tempAvatar, setTempAvatar] = useState(user.avatarUrl);

    // Slider ref for hero cards
    const sliderRef = useRef(null);

    const loadBoard = async () => {
        try {
            const data = await fetchLeaderboard();
            setLeaderboard(data);
        } catch {
            console.error("Failed to load leaderboard");
        }
    };

    const handleUpdateAvatar = async () => {
        try {
            console.log("Updating avatar for user:", user.username);
            const encodedUsername = encodeURIComponent(user.username);
            const finalAvatarUrl = tempAvatar.replace(user.username, encodedUsername);
            
            const updatedUser = await updateProfile({ avatarUrl: finalAvatarUrl }, user.token);
            console.log("Profile updated successfully:", updatedUser);
            
            loginStore(updatedUser);
            setShowAvatarPicker(false);
            audioManager.playSuccess();
            
            // Refresh leaderboard to reflect new avatar
            await loadBoard();
        } catch (err) {
            console.error("Failed to update avatar", err);
            audioManager.playGlitch();
            
            // Auto logout if session expired
            if (err.response?.status === 401) {
                console.warn("Session expired. Logging out...");
                logout();
                navigate('/login');
            }
        }
    };

    useEffect(() => {
        loadBoard();
    }, []);

    const handleFetchHeroes = async () => {
        if (heroes.length === 0) {
            setLoadingHeroes(true);
            try {
                const data = await fetchSuperHeroes();
                // Take more heroes this time to demo the slider
                setHeroes(data.slice(0, 30));
            } catch {
                console.error("Failed to load heroes");
            } finally {
                setLoadingHeroes(false);
            }
        }
        setShowHeroes(true);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const scrollHeroes = (direction) => {
        if (sliderRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // Reset tempAvatar when modal opens to ensure consistency
    useEffect(() => {
        if (showAvatarPicker) {
            setTempAvatar(user.avatarUrl);
        }
    }, [showAvatarPicker, user.avatarUrl]);

    return (
        <div className="dashboard">

            {/* Main Header */}
            <div className="dashboard-header">
                <h1 className="glitch-text">CYBER_DASHBOARD</h1>
                <div className="status-text">STATUS: ONLINE_&amp;_SECURE</div>
            </div>

            {/* Profile & Controls Widget */}
            <div className="glass-panel dashboard-panel">
                <div className="panel-corner corner-tl" />
                <div className="panel-corner corner-br" />

                <div className="profile-header">
                    <div className="avatar-overlay" />
                    <div className="profile-avatar-container">
                        <img src={user.avatarUrl} alt="Avatar" className="profile-avatar" />
                        <button className="avatar-edit" onClick={() => setShowAvatarPicker(true)} aria-label="Edit Avatar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        </button>
                    </div>
                    <h2>{user.username}</h2>
                    <p className="profile-class">CLASS: ROGUE_AGENT</p>
                </div>

                <div className="panel-actions">
                    <button className="btn-primary" onClick={() => { audioManager.init(); navigate('/game'); }}>
                        DEPLOY TO GRID
                    </button>

                    <button className="btn-secondary" onClick={() => { audioManager.init(); handleFetchHeroes(); }}>
                        {selectedHero ? `SYNCED: ${selectedHero.name}` : 'AWAITING HERO SYNC'}
                    </button>

                    <button className="btn-danger" onClick={handleLogout}>
                        TERMINATE SESSION
                    </button>
                </div>
            </div>

            {/* Avatar Picker Modal */}
            {showAvatarPicker && (
                <div className="modal-overlay">
                    <div className="glass-panel modal-content">
                        <div className="panel-corner corner-tl" />
                        <div className="panel-corner corner-br" />
                        <h2 className="modal-title">// IDENTITY_CUSTOMIZATION</h2>

                        <div className="avatar-grid">
                            {['set1', 'set2', 'set3', 'set4'].map((set, idx) => {
                                const encodedUsername = encodeURIComponent(user.username);
                                const avatarOptionUrl = `https://robohash.org/${encodedUsername}?set=${set}`;
                                const isSelected = tempAvatar?.includes(set);

                                return (
                                    <div
                                        key={set}
                                        className={`avatar-option ${isSelected ? 'selected' : ''}`}
                                        onClick={() => setTempAvatar(avatarOptionUrl)}
                                    >
                                        <img src={avatarOptionUrl} alt={set} />
                                        <div className="avatar-label">STYLE_0{idx + 1}</div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="modal-actions">
                            <button className="btn-primary btn-block" onClick={handleUpdateAvatar}>CONFIRM_IDENTITY</button>
                            <button className="btn-secondary btn-block" onClick={() => setShowAvatarPicker(false)}>ABORT</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="dashboard-content">

                {/* Hero Selection Widget */}
                {showHeroes && (
                    <div className="glass-panel hero-section">
                        <div className="panel-corner corner-tl" />
                        <div className="panel-corner corner-br" />

                        <div className="hero-header">
                            <h2>// HERO_DATABASE_LINK</h2>
                            <button className="btn-secondary hero-close" onClick={() => setShowHeroes(false)}>CLOSE</button>
                        </div>

                        {loadingHeroes ? (
                            <div className="hero-loading">[ Fetching from SuperHero API... ]</div>
                        ) : (
                            <div className="slider-container">
                                <div ref={sliderRef} className="hero-slider">
                                    {heroes.map(h => {
                                        const isSelected = selectedHero?.id === h.id;
                                        return (
                                            <div
                                                key={h.id}
                                                className={`hero-card ${isSelected ? 'selected' : ''}`}
                                                onClick={() => { audioManager.playBeep(isSelected ? 220 : 440); setHero(h); setShowHeroes(false); }}
                                            >
                                                <div className="hero-img-wrapper">
                                                    <img src={h.images.sm} alt={h.name} />
                                                </div>
                                                <div className="hero-meta">
                                                    <div className="name">
                                                        <DecodingText text={h.name} active={isSelected} />
                                                    </div>
                                                    <div className="stats">
                                                        <span>SPD: {h.powerstats.speed}</span>
                                                        <span className="secondary">STR: {h.powerstats.strength}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Slider Controls */}
                                <button className="slider-control left" onClick={() => scrollHeroes('left')}>&lt;</button>
                                <button className="slider-control right" onClick={() => scrollHeroes('right')}>&gt;</button>
                            </div>
                        )}
                    </div>
                )}

                {/* Leaderboard Widget */}
                <div className="glass-panel leaderboard">
                    <div className="panel-corner corner-tl" />
                    <div className="panel-corner corner-br" />

                    <div className="leaderboard-header">
                        <h2>// HALL_OF_FAME</h2>
                        <span className="leaderboard-subtitle">GLOBAL RANKINGS</span>
                    </div>

                    <div className="leaderboard-list">
                        {leaderboard.length === 0 ? (
                            <p className="leaderboard-empty">[ No records found in Database ]</p>
                        ) : (
                            leaderboard.map((score, index) => {
                                const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
                                const playerClass = index === 0 ? 'top' : '';

                                return (
                                    <div key={score._id} className="leaderboard-row">
                                        <div className={`rank-badge ${rankClass}`}>{index + 1}</div>
                                        <img src={score.userId?.avatarUrl} alt="Avatar" className="leaderboard-avatar" />

                                        <div className="leaderboard-details">
                                            <div className={`leaderboard-player ${playerClass}`}>{score.userId?.username || 'GHOST_USER'}</div>
                                            <div className="leaderboard-subtext">Nodes Cleared: {score.puzzlesSolved}</div>
                                        </div>

                                        <div className="leaderboard-score">
                                            <div className="leaderboard-score-value">{score.distance}</div>
                                            <div className="leaderboard-score-label">EXP_RATING</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

            </div>

            <style>{`
                @keyframes spin { 100% { transform: translateX(-50%) rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Home;
