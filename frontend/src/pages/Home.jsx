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
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '2rem', flexWrap: 'wrap', minHeight: '100vh', alignItems: 'flex-start' }}>

            {/* Main Header */}
            <div style={{ width: '100%', borderBottom: '1px solid var(--primary)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="glitch-text" style={{ fontSize: '2rem', textShadow: 'none', margin: 0, color: 'var(--primary)' }}>Neon Runner</h1>
                <div style={{ color: 'var(--terminal-green)' }}>STATUS: ONLINE_&amp;_SECURE</div>
            </div>

            {/* Profile & Controls Widget */}
            <div className="glass-panel" style={{ flex: '1', minWidth: '300px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'fit-content' }}>
                <div className="panel-corner corner-tl"></div>
                <div className="panel-corner corner-br"></div>
                <div style={{ textAlign: 'center', position: 'relative' }}>
                    <div style={{
                        position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                        width: '140px', height: '140px', borderRadius: '50%',
                        border: '1px dashed var(--secondary)', animation: 'spin 10s linear infinite'
                    }}></div>

                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img
                            src={user.avatarUrl}
                            alt="Avatar"
                            style={{ width: '120px', height: '120px', borderRadius: '50%', border: '2px solid var(--primary)', backgroundColor: 'var(--bg-dark)', position: 'relative', zIndex: 2 }}
                        />
                        <button
                            onClick={() => setShowAvatarPicker(true)}
                            style={{
                                position: 'absolute', bottom: '5px', right: '5px', zIndex: 3,
                                background: 'var(--primary)', border: 'none', borderRadius: '50%',
                                width: '32px', height: '32px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 0 10px rgba(0,240,255,0.5)'
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        </button>
                    </div>
                    <h2 style={{ marginTop: '1.5rem', color: '#fff', letterSpacing: '2px' }}>{user.username}</h2>
                    <p style={{ color: 'var(--primary)', fontFamily: 'Orbitron', fontSize: '0.8rem' }}>CLASS: ROGUE_AGENT</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <button className="btn-primary" onClick={() => { audioManager.init(); navigate('/game'); }} style={{ fontSize: '1.2rem', padding: '1rem', border: '1px solid var(--primary)' }}>
                        DEPLOY TO GRID
                    </button>

                    <button className="btn-secondary" onClick={() => { audioManager.init(); handleFetchHeroes(); }}>
                        {selectedHero ? `SYNCED: ${selectedHero.name}` : 'AWAITING HERO SYNC'}
                    </button>

                    <button className="btn-danger" onClick={handleLogout} style={{ marginTop: '2rem', background: 'transparent' }}>
                        TERMINATE SESSION
                    </button>
                </div>
            </div>

            {/* Avatar Picker Modal */}
            {showAvatarPicker && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)'
                }}>
                    <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '2rem' }}>
                        <div className="panel-corner corner-tl"></div>
                        <div className="panel-corner corner-br"></div>
                        <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontSize: '1.2rem' }}>// IDENTITY_CUSTOMIZATION</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                            {['set1', 'set2', 'set3', 'set4'].map((set, idx) => {
                                const encodedUsername = encodeURIComponent(user.username);
                                const avatarOptionUrl = `https://robohash.org/${encodedUsername}?set=${set}`;
                                const isSelected = tempAvatar?.includes(set);
                                
                                return (
                                    <div
                                        key={set}
                                        onClick={() => setTempAvatar(avatarOptionUrl)}
                                        style={{
                                            border: `1px solid ${isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                                            padding: '1rem', borderRadius: '4px', cursor: 'pointer', textAlign: 'center',
                                            background: isSelected ? 'rgba(0,240,255,0.05)' : 'transparent',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <img src={avatarOptionUrl} alt={set} style={{ width: '80px', height: '80px' }} />
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>STYLE_0{idx + 1}</div>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn-primary" style={{ flex: 1 }} onClick={handleUpdateAvatar}>CONFIRM_IDENTITY</button>
                            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowAvatarPicker(false)}>ABORT</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div style={{ flex: '2', minWidth: '500px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Hero Selection Widget */}
                {showHeroes && (
                    <div className="glass-panel" style={{ padding: '2rem', animation: 'crtTurnOn 0.3s' }}>
                        <div className="panel-corner corner-tl"></div>
                        <div className="panel-corner corner-br"></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(0, 240, 255, 0.2)', paddingBottom: '0.5rem' }}>
                            <h2 style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>// HERO_DATABASE_LINK</h2>
                            <button className="btn-secondary" onClick={() => setShowHeroes(false)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>CLOSE</button>
                        </div>

                        {loadingHeroes ? <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--terminal-green)' }}>[ Fetching from SuperHero API... ]</div> : (
                            <div style={{ position: 'relative' }}>
                                {/* Horizontal Slider */}
                                <div
                                    ref={sliderRef}
                                    className="hero-slider"
                                    style={{
                                        display: 'flex', gap: '1.5rem', overflowX: 'auto', padding: '1rem 0',
                                        scrollbarWidth: 'none', msOverflowStyle: 'none'
                                    }}
                                >
                                    {heroes.map(h => (
                                        <div
                                            key={h.id}
                                            onClick={() => { audioManager.playBeep(selectedHero?.id === h.id ? 220 : 440); setHero(h); setShowHeroes(false); }}
                                            style={{
                                                minWidth: '150px',
                                                cursor: 'pointer',
                                                border: selectedHero?.id === h.id ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '4px',
                                                background: 'rgba(0,0,0,0.6)',
                                                overflow: 'hidden',
                                                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                                boxShadow: selectedHero?.id === h.id ? '0 0 15px rgba(0,240,255,0.4)' : 'none',
                                                transform: selectedHero?.id === h.id ? 'translateY(-5px)' : 'none'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (selectedHero?.id !== h.id) {
                                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                                    e.currentTarget.style.borderColor = 'var(--secondary)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (selectedHero?.id !== h.id) {
                                                    e.currentTarget.style.transform = 'none';
                                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                                }
                                            }}
                                        >
                                            <div style={{ height: '180px', overflow: 'hidden' }}>
                                                <img src={h.images.sm} alt={h.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.2) sepia(0.2)' }} />
                                            </div>
                                            <div style={{ padding: '0.8rem', backgroundColor: 'var(--bg-dark)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                                    <DecodingText text={h.name} active={selectedHero?.id === h.id} />
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginTop: '0.5rem', color: 'var(--terminal-green)' }}>
                                                    <span>SPD: {h.powerstats.speed}</span>
                                                    <span style={{ color: 'var(--secondary)' }}>STR: {h.powerstats.strength}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Slider Controls */}
                                <button
                                    onClick={() => scrollHeroes('left')}
                                    style={{ position: 'absolute', left: '-20px', top: '50%', transform: 'translateY(-50%)', background: 'var(--bg-dark)', border: '1px solid var(--primary)', color: 'var(--primary)', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}
                                >&lt;</button>
                                <button
                                    onClick={() => scrollHeroes('right')}
                                    style={{ position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)', background: 'var(--bg-dark)', border: '1px solid var(--primary)', color: 'var(--primary)', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}
                                >&gt;</button>
                            </div>
                        )}
                    </div>
                )}

                {/* Leaderboard Widget */}
                <div className="glass-panel" style={{ padding: '2rem', flex: 1 }}>
                    <div className="panel-corner corner-tl"></div>
                    <div className="panel-corner corner-br"></div>
                    <div style={{ borderBottom: '1px solid rgba(0, 240, 255, 0.2)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                        <h2 style={{ color: '#fff', fontSize: '1.2rem' }}>// HALL_OF_FAME</h2>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>GLOBAL RANKINGS</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {leaderboard.length === 0 ? <p style={{ color: 'var(--terminal-green)' }}>[ No records found in Database ]</p> : leaderboard.map((score, index) => {
                            // Determine medal colors
                            let rankColor = 'var(--text-muted)';
                            let rankBg = 'transparent';
                            let borderCol = 'rgba(255,255,255,0.05)';

                            if (index === 0) { rankColor = '#000'; rankBg = '#ffd700'; borderCol = '#ffd700'; } // Gold
                            else if (index === 1) { rankColor = '#000'; rankBg = '#c0c0c0'; borderCol = '#c0c0c0'; } // Silver
                            else if (index === 2) { rankColor = '#000'; rankBg = '#cd7f32'; borderCol = '#cd7f32'; } // Bronze

                            return (
                                <div key={score._id} style={{
                                    display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.4)',
                                    padding: '1rem', borderRadius: '4px', border: `1px solid ${borderCol}`,
                                    transition: 'all 0.2s',
                                    position: 'relative', overflow: 'hidden'
                                }}>

                                    <div style={{
                                        position: 'absolute', left: 0, top: 0, bottom: 0, width: '40px',
                                        background: rankBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold', fontSize: '1.2rem', color: rankColor
                                    }}>
                                        {index === 0 && <span style={{ position: 'absolute', animation: 'pulseGlow 2s infinite' }}>⭐</span>}
                                        <span style={{ position: 'relative', zIndex: 2 }}>{index + 1}</span>
                                    </div>

                                    <img src={score.userId?.avatarUrl} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', marginLeft: '50px', marginRight: '1rem', border: '1px solid rgba(255,255,255,0.2)' }} />

                                    <div style={{ flex: '1' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: index === 0 ? '#ffd700' : '#fff' }}>{score.userId?.username || 'GHOST_USER'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--terminal-green)' }}>Nodes Cleared: {score.puzzlesSolved}</div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: index === 0 ? '#ffd700' : 'var(--primary)', fontWeight: 'bold', fontSize: '1.4rem', fontFamily: 'Orbitron' }}>
                                            {score.distance}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>EXP_RATING</div>
                                    </div>
                                </div>
                            );
                        })}
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
