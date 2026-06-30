// Web Audio API Synthesizer for high-fidelity 8-bit retro sound effects
let audioCtx: AudioContext | null = null;
let soundEnabled = false;

export const retroAudio = {
  toggleSound: (enabled: boolean) => {
    soundEnabled = enabled;
  },
  isSoundEnabled: () => soundEnabled,
  
  playTone: (freq: number, type: OscillatorType, duration: number, volume: number = 0.1) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      
      gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context blocked by browser policy:", e);
    }
  },
  
  playSelect: () => {
    // Selection chime: quick bleep
    retroAudio.playTone(600, "square", 0.08, 0.05);
  },
  
  playCoin: () => {
    // Mario-style coin dual tone
    if (!soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const now = audioCtx.currentTime;
      
      const playToneAt = (freq: number, start: number, duration: number) => {
        const osc = audioCtx!.createOscillator();
        const gainNode = audioCtx!.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, start);
        gainNode.gain.setValueAtTime(0.08, start);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.connect(gainNode);
        gainNode.connect(audioCtx!.destination);
        osc.start(start);
        osc.stop(start + duration);
      };
      
      playToneAt(987.77, now, 0.08); // B5
      playToneAt(1318.51, now + 0.08, 0.25); // E6
    } catch (e) {
      console.warn(e);
    }
  },
  
  playLevelUp: () => {
    // Rising triumphant major chord
    if (!soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const now = audioCtx.currentTime;
      const playToneAt = (freq: number, start: number, duration: number) => {
        const osc = audioCtx!.createOscillator();
        const gain = audioCtx!.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.1, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.connect(gain);
        gain.connect(audioCtx!.destination);
        osc.start(start);
        osc.stop(start + duration);
      };
      playToneAt(523.25, now, 0.1); // C5
      playToneAt(659.25, now + 0.08, 0.1); // E5
      playToneAt(783.99, now + 0.16, 0.1); // G5
      playToneAt(1046.50, now + 0.24, 0.3); // C6
    } catch (e) {}
  },
  
  playError: () => {
    // Low harsh tone
    retroAudio.playTone(180, "sawtooth", 0.25, 0.08);
  },
  
  playUnlock: () => {
    // Bright synthesizer ding
    retroAudio.playTone(880, "sine", 0.15, 0.08);
    setTimeout(() => {
      retroAudio.playTone(1760, "sine", 0.3, 0.05);
    }, 80);
  }
};
