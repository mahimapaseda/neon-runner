import React from 'react';
import useSettingsStore from '../../store/settingsStore';
import audioManager from '../../services/audioManager';

const SettingsModal = ({ isOpen, onClose }) => {
    const { 
        bgmVolume, sfxVolume, isMuted, crtFilter,
        setBgmVolume, setSfxVolume, toggleMute, toggleCrtFilter 
    } = useSettingsStore();

    if (!isOpen) return null;

    const handleInteraction = () => {
        if (!audioManager.initialized) {
            audioManager.init();
        }
    };

    const SliderField = ({ label, value, onChange, disabled }) => (
        <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontFamily: 'Fira Code', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{Math.round(value * 100)}%</span>
            </div>
            <input 
                type="range" min="0" max="1" step="0.01" 
                value={value} 
                onChange={(e) => onChange(parseFloat(e.target.value))}
                disabled={disabled}
                style={{ 
                    width: '100%', cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.3 : 1
                }}
            />
        </div>
    );

    const ToggleField = ({ label, active, onToggle, activeLabel = "ON", inactiveLabel = "OFF" }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-main)', fontFamily: 'Fira Code', fontSize: '0.9rem' }}>{label}</span>
            <button 
                className="btn-secondary"
                onClick={onToggle}
                style={{ 
                    padding: '4px 12px', fontSize: '0.7rem',
                    background: active ? 'rgba(0,240,255,0.1)' : 'transparent',
                    borderColor: active ? 'var(--primary)' : 'var(--text-muted)',
                    color: active ? 'var(--primary)' : 'var(--text-muted)'
                }}
            >
                {active ? activeLabel : inactiveLabel}
            </button>
        </div>
    );

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(2,2,5,0.9)', backdropFilter: 'blur(15px)'
        }} onClick={onClose}>
            
            <div 
                className="glass-panel" 
                style={{ 
                    padding: '2.5rem', width: '90%', maxWidth: '420px', 
                    border: '1px solid var(--primary)', 
                    boxShadow: '0 0 40px rgba(0,240,255,0.15)',
                    position: 'relative' 
                }}
                onClick={(e) => { e.stopPropagation(); handleInteraction(); }}
            >
                <div className="panel-corner corner-tl" />
                <div className="panel-corner corner-br" />

                <div className="scanline-effect" style={{ opacity: 0.1 }} />

                <h2 className="glitch-text" style={{ 
                    fontSize: '1.8rem', marginBottom: '2rem', color: 'var(--primary)'
                }}>
                    SYSTEM_LINK
                </h2>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <ToggleField label="MASTER_MUTE" active={isMuted} onToggle={toggleMute} activeLabel="MUTED" inactiveLabel="ACTIVE" />
                    
                    <div style={{ height: '1px', background: 'rgba(0,240,255,0.1)', margin: '1rem 0' }} />

                    <SliderField label="BGM_CHANNEL" value={bgmVolume} onChange={setBgmVolume} disabled={isMuted} />
                    <SliderField label="SFX_CHANNEL" value={sfxVolume} onChange={setSfxVolume} disabled={isMuted} />

                    <div style={{ height: '1px', background: 'rgba(0,240,255,0.1)', margin: '1rem 0' }} />

                    <ToggleField label="CRT_SCANLINES" active={crtFilter} onToggle={toggleCrtFilter} />
                </div>

                <button 
                    className="btn-primary" 
                    onClick={onClose}
                    style={{ width: '100%', marginTop: '2rem', padding: '12px' }}
                >
                    CLOSE_LINK
                </button>

                <div style={{ 
                    marginTop: '1.5rem', textAlign: 'center', 
                    color: 'var(--text-muted)', fontSize: '0.65rem', 
                    fontFamily: 'Fira Code', letterSpacing: '2px', opacity: 0.5
                }}>
                    NEURAL_ADDR: 0x7F000001 // BYPASS: OK
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
