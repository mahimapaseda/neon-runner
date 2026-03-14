/**
 * Simple Audio Manager for Cyber Runner
 * Handles background ambient tracks and SFX for UI/Gameplay.
 */

import useSettingsStore from '../store/settingsStore';

class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.bgmGain = null;
        this.sfxGain = null;
        this.initialized = false;
        this.bgmPlaying = false;
        this.bgmOscillators = [];
        this.sequenceInterval = null;
        this.currentLevel = 1;
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
        
        console.log("Audio Engine Initialized.");
    }

    syncSettings(state = useSettingsStore.getState()) {
        if (!this.initialized) return;
        
        const masterVolume = state.isMuted ? 0 : 1;
        this.masterGain.gain.setTargetAtTime(masterVolume, this.ctx.currentTime, 0.1);

        // Individual gains
        this.bgmGain.gain.setTargetAtTime(state.bgmVolume, this.ctx.currentTime, 0.1);
        this.sfxGain.gain.setTargetAtTime(state.sfxVolume, this.ctx.currentTime, 0.1);
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

    // --- Procedural Synthwave BGM ---
    startBGM(level = 1) {
        if (!this.initialized) this.init();
        
        // If playing and level changed, restart
        if (this.bgmPlaying && this.currentLevel !== level) {
            this.stopBGM();
        } else if (this.bgmPlaying) {
            return;
        }

        this.currentLevel = level;
        this.bgmPlaying = true;

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        // Sequences based on level
        const seq1 = [110.00, 110.00, 220.00, 110.00, 130.81, 110.00, 164.81, 110.00];
        const seq2 = [110.00, 164.81, 130.81, 110.00, 196.00, 110.00, 220.00, 164.81];
        const seq3 = [220.00, 110.00, 261.63, 110.00, 329.63, 220.00, 196.00, 130.81];

        let sequence;
        if (this.currentLevel === 1) sequence = [...seq1, ...seq1];
        else if (this.currentLevel === 2) sequence = [...seq1, ...seq2];
        else sequence = [...seq2, ...seq3];

        let step = 0;
        // Tempo increases slightly each level
        const tempo = 140 + (this.currentLevel * 5); // BPM
        const stepTime = (60 / tempo) / 4; // 16th notes

        const playBassNote = () => {
            if (!this.bgmPlaying) return;

            const freq = sequence[step % sequence.length];
            step++;

            // Create Synths
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();

            // Sawtooth for that retro grit
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            // Slight detune for thickness
            osc.detune.value = (Math.random() - 0.5) * 10;

            // Lowpass filter envelope
            filter.type = 'lowpass';
            filter.Q.value = 5;
            filter.frequency.setValueAtTime(freq * 8, this.ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + stepTime * 0.8);

            // Amp Envelope (Pluck)
            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.02); // quick attack
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + stepTime * 0.9); // decay

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.bgmGain); // Connect to BGM bus

            osc.start(this.ctx.currentTime);
            osc.stop(this.ctx.currentTime + stepTime);

            // Keep track for cleanup
            this.bgmOscillators.push(osc);
            // Clean up old oscillators
            if (this.bgmOscillators.length > 20) {
                this.bgmOscillators.shift();
            }
        };

        // Start sequencer loop
        playBassNote();
        this.sequenceInterval = setInterval(playBassNote, stepTime * 1000);
    }

    stopBGM() {
        this.bgmPlaying = false;
        clearInterval(this.sequenceInterval);
        this.bgmOscillators.forEach(osc => {
            try { osc.stop(); } catch (e) { /* ignore */ }
        });
        this.bgmOscillators = [];
    }
}

const audioManager = new AudioManager();
export default audioManager;
