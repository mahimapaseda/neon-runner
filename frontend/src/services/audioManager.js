/**
 * Simple Audio Manager for Cyber Runner
 * Handles background music tracks and SFX for UI/Gameplay.
 */

import useSettingsStore from '../store/settingsStore';

// Tracks from the built-in music folder (public/music)
// We URL-encode file names to keep browser URL handling consistent (spaces, accents, etc.)
const MUSIC_TRACKS = [
    encodeURI('/music/FUNK CRIMINAL (SLOWED).mp3'),
    encodeURI('/music/MASHUQ HAQUE - AIRTEL PHONK  A. R. RAHMAN (PHONK).mp3'),
    encodeURI('/music/NO BATIDÃO (Slowed).mp3'),
    encodeURI('/music/PASSO BEM SOLTO (Slowed).mp3')
];

class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.bgmGain = null;
        this.sfxGain = null;
        this.initialized = false;
        this.bgmPlaying = false;
        this.currentLevel = 1;

        this.bgmAudio = null;
        this.bgmSource = null;
        this.bgmTrackList = MUSIC_TRACKS;
    }

    init() {
        if (this.initialized) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();

        // Setup Master Gain (Main Mute)
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);

        // Setup BGM Gain
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.connect(this.masterGain);

        // Setup SFX Gain
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.connect(this.masterGain);

        this.initialized = true;
        this.syncSettings();

        // Subscribe to settings changes
        useSettingsStore.subscribe((state) => this.syncSettings(state));

        console.log('Audio Engine Initialized.');
    }

    syncSettings(state = useSettingsStore.getState()) {
        if (!this.initialized) return;

        const masterVolume = state.isMuted ? 0 : 1;
        this.masterGain.gain.setTargetAtTime(masterVolume, this.ctx.currentTime, 0.1);

        // Individual gains
        this.bgmGain.gain.setTargetAtTime(state.bgmVolume, this.ctx.currentTime, 0.1);
        this.sfxGain.gain.setTargetAtTime(state.sfxVolume, this.ctx.currentTime, 0.1);

        // If we have a HTMLAudioElement, keep it in sync too
        if (this.bgmAudio) {
            this.bgmAudio.volume = state.isMuted ? 0 : 1;
        }
    }

    // Play a procedurally generated "beep" for UI
    playBeep(freq = 440, duration = 0.1, type = 'square') {
        if (!this.initialized) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.sfxGain); // Connect SFX to SFX bus

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playGlitch() {
        if (!this.initialized) return;
        this.playBeep(110 + Math.random() * 220, 0.05, 'sawtooth');
    }

    playSuccess() {
        if (!this.initialized) return;
        this.playBeep(880, 0.1);
        setTimeout(() => this.playBeep(1320, 0.2), 100);
    }

    _createBgmAudio(level) {
        const index = (level - 1) % this.bgmTrackList.length;
        const src = this.bgmTrackList[index];
        const audio = new Audio(src);
        audio.loop = true;
        audio.crossOrigin = 'anonymous';
        audio.volume = 1;
        return audio;
    }

    startBGM(level = 1) {
        if (!this.initialized) this.init();

        // If already playing same level track, do nothing
        if (this.bgmPlaying && this.currentLevel === level) {
            return;
        }

        // Stop existing track
        this.stopBGM();

        this.currentLevel = level;
        this.bgmPlaying = true;

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        this.bgmAudio = this._createBgmAudio(level);
        try {
            this.bgmSource = this.ctx.createMediaElementSource(this.bgmAudio);
            this.bgmSource.connect(this.bgmGain);
        } catch (err) {
            console.warn('Failed to route BGM through WebAudio:', err);
            // Fall back to direct element playback
            this.bgmAudio = null;
        }

        if (this.bgmAudio) {
            this.bgmAudio.play().catch((err) => {
                console.warn('BGM playback failed:', err);
            });
        }
    }

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmAudio) {
            this.bgmAudio.pause();
            this.bgmAudio.currentTime = 0;
            this.bgmAudio = null;
        }
        if (this.bgmSource) {
            try {
                this.bgmSource.disconnect();
            } catch (err) {
                // ignore
            }
            this.bgmSource = null;
        }
    }
}

const audioManager = new AudioManager();
export default audioManager;
