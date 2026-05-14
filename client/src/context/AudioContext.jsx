import React, { createContext, useContext, useRef, useEffect } from 'react';

const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
  const audioCtxRef = useRef(null);

  useEffect(() => {
    const initAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
    };
    
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });
    
    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
  }, []);

  const playPop = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    // Resume context if suspended (browser policy)
    if (ctx.state === 'suspended') ctx.resume();
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  };

  const playError = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    if (ctx.state === 'suspended') ctx.resume();
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'square';
    
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500;
    
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  };

  return (
    <AudioContext.Provider value={{ playPop, playError }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
