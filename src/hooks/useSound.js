import { useCallback, useRef, useEffect } from 'react';

export default function useSound() {
  const audioContext = useRef(null);

  useEffect(() => {
    // Initialize AudioContext on user interaction if needed, 
    // strictly speaking it should be resumed on interaction but creating it here usually works for now.
    // We lazily create it in the play functions if null.
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  const getContext = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.current.state === 'suspended') {
      audioContext.current.resume();
    }
    return audioContext.current;
  };

  const playMove = useCallback(() => {
    try {
      const ctx = getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  }, []);

  const playCapture = useCallback(() => {
    try {
      const ctx = getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Sharp "hit"
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
         console.error("Audio play failed", e);
    }
  }, []);

  const playCheck = useCallback(() => {
      try {
        const ctx = getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
  
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        // Beep-beep
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0, ctx.currentTime + 0.25);
  
        osc.connect(gain);
        gain.connect(ctx.destination);
  
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch (e) {}
  }, []);

  const playGameEnd = useCallback(() => {
    try {
        const ctx = getContext();
        // Simple major triad arpeggio
        [440, 554, 659].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const start = ctx.currentTime + i * 0.1;
            
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.3, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.5);
        });
    } catch (e) {}
  }, []);

  return { playMove, playCapture, playCheck, playGameEnd };
}
