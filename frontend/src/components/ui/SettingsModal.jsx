import React, { useEffect, useState } from 'react';
import useSettingsStore from '../../store/settingsStore';
import audioManager from '../../services/audioManager';

const SettingsModal = ({ isOpen, onClose }) => {
    const { volume, isMuted, setVolume, toggleMute } = useSettingsStore();

    // Prevent rendering if not open
    if (!isOpen) return null;

    // A small helper to try forcing AudioContext unlock if the user interacts with settings
    const handleInteraction = () => {
        if (!audioManager.initialized) {
            audioManager.init();
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(5,5,8,0.8)', backdropFilter: 'blur(10px)'
        }} onClick={onClose}>
            
            {/* Modal Content - Stop propagation so clicking inside doesn't close it */}
            <div 
                className="glass-panel" 
                style={{ 
                    padding: '3rem', width: '90%', maxWidth: '400px', 
                    border: '1px solid var(--primary)', 
                    position: 'relative' 
                }}
                onClick={(e) => { e.stopPropagation(); handleInteraction(); }}
            >
                <div className="panel-corner corner-tl" />
                <div className="panel-corner corner-br" />

                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '15px', right: '15px',
                        background: 'transparent', border: 'none', color: 'var(--primary)',
                        fontSize: '1.5rem', cursor: 'pointer'
                    }}
                >
                    &times;
                </button>

                <h2 className="glitch-text" style={{ 
                    color: 'var(--primary)', marginBottom: '2rem', 
                    fontSize: '2rem', textAlign: 'center', textShadow: 'none'
                }}>
                    SYS_CONFIG
                </h2>

                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--text-main)', fontFamily: 'Fira Code' }}>MASTER_VOLUME</span>
                        <span style={{ color: 'var(--primary)', fontFamily: 'Fira Code', fontWeight: 'bold' }}>
                            {isMuted ? 'MUTE' : `${Math.round(volume * 100)}%`}
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button 
                            className="btn-secondary" 
                            style={{ 
                                padding: '0.5rem 1rem', 
                                background: isMuted ? 'var(--secondary)' : 'transparent',
                                borderColor: isMuted ? 'var(--secondary)' : 'var(--primary)',
                                color: isMuted ? '#000' : 'var(--primary)'
                            }}
                            onClick={toggleMute}
                        >
                            {isMuted ? 'UNMUTE' : 'MUTE'}
                        </button>

                        <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.01" 
                            value={volume}
                            disabled={isMuted}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            style={{ 
                                flex: 1, 
                                cursor: isMuted ? 'not-allowed' : 'pointer',
                                opacity: isMuted ? 0.3 : 1
                            }}
                        />
                    </div>
                </div>

                <div style={{ 
                    marginTop: '2rem', paddingTop: '1rem', 
                    borderTop: '1px solid rgba(0,240,255,0.2)', 
                    textAlign: 'center', color: 'var(--text-muted)', 
                    fontSize: '0.8rem', fontFamily: 'Fira Code' 
                }}>
                    BGM_SYNC: PROCEDURAL_OSC<br/>
                    STATUS: ACTIVE
                </div>

            </div>
        </div>
    );
};

export default SettingsModal;
