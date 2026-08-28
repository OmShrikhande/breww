import { useCallback, useMemo, useRef } from 'react';

const soundModules = import.meta.glob('../../assets/sounds/*.{mp3,wav,ogg}', {
  eager: true,
  import: 'default',
});

const normalizeName = (value) => value.replace(/\.[^.]+$/, '').toLowerCase();

const soundMap = Object.entries(soundModules).reduce((accumulator, [path, url]) => {
  const filename = path.split('/').pop();
  accumulator[normalizeName(filename)] = url;
  return accumulator;
}, {});

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  return AudioContextClass ? new AudioContextClass() : null;
};

export const useChamberAudio = (enabled) => {
  const audioContextRef = useRef(null);

  const resolvedSounds = useMemo(
    () => ({
      spin: soundMap.spin || soundMap['spin-sound'] || null,
      safe: soundMap.safe || null,
      lose: soundMap.lose || null,
      cashout: soundMap.cashout || null,
    }),
    []
  );

  const playToneFallback = useCallback((name) => {
    if (typeof window === 'undefined') return;

    if (!audioContextRef.current) {
      audioContextRef.current = getAudioContext();
    }

    const context = audioContextRef.current;
    if (!context) return;

    const toneMap = {
      spin: { frequency: 420, duration: 0.22, type: 'triangle' },
      safe: { frequency: 620, duration: 0.28, type: 'sine' },
      lose: { frequency: 180, duration: 0.4, type: 'sawtooth' },
      cashout: { frequency: 760, duration: 0.55, type: 'square' },
    };

    const tone = toneMap[name];
    if (!tone) return;

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    const now = context.currentTime;

    oscillator.type = tone.type;
    oscillator.frequency.setValueAtTime(tone.frequency, now);
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.08, now + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + tone.duration);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + tone.duration);
  }, []);

  const playSound = useCallback(
    (name) => {
      if (!enabled || typeof window === 'undefined') return;

      const source = resolvedSounds[name];
      if (source) {
        const audio = new Audio(source);
        audio.volume = name === 'lose' ? 0.35 : 0.28;
        audio.play().catch(() => {
          playToneFallback(name);
        });
        return;
      }

      playToneFallback(name);
    },
    [enabled, playToneFallback, resolvedSounds]
  );

  return { playSound, resolvedSounds };
};

export default useChamberAudio;
