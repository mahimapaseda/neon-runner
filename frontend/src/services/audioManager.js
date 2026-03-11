/**
 * Simple Audio Manager for Cyber Runner
 * Handles background ambient tracks and SFX for UI/Gameplay.
 */

class AudioManager {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        this.sounds = {};
    }

    init() {
        if (this.initialized) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.initialized = true;
        console.log("Audio Engine Initialized.");
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
        gain.connect(this.ctx.destination);

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
}

const audioManager = new AudioManager();
export default audioManager;
