import React, { createContext, useContext, useState, useEffect } from 'react';
import * as soundEngine from '../utils/soundFx';

const AudioContext = createContext({
  soundEnabled: true,
  musicEnabled: true,
  toggleSound: () => {},
  toggleMusic: () => {},
  playChip: () => {},
  playCard: () => {},
  playDiceShake: () => {},
  playDiceRoll: () => {},
  playGem: () => {},
  playBomb: () => {},
  playWin: () => {},
  playCashout: () => {},
  playLose: () => {},
  playTakeoff: () => {},
  playFlyAway: () => {},
  playTick: () => {},
  playDragon: () => {},
  playTiger: () => {},
  playTie: () => {},
});

export const AudioProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem('breww_sound_enabled');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  const [musicEnabled, setMusicEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem('breww_music_enabled');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('breww_sound_enabled', String(soundEnabled));
    } catch (_) {}
  }, [soundEnabled]);

  useEffect(() => {
    // Ensure any background ambient music is stopped and never plays continuously
    try {
      soundEngine.stopAmbientMusic();
      localStorage.setItem('breww_music_enabled', 'false');
    } catch (_) {}
  }, []);

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const toggleMusic = () => {
    setMusicEnabled((prev) => !prev);
  };

  const playChip = () => soundEnabled && soundEngine.playChipSound();
  const playCard = () => soundEnabled && soundEngine.playCardSound();
  const playDiceShake = () => soundEnabled && soundEngine.playDiceShakeSound();
  const playDiceRoll = () => soundEnabled && soundEngine.playDiceRollSound();
  const playGem = () => soundEnabled && soundEngine.playGemSound();
  const playBomb = () => soundEnabled && soundEngine.playBombSound();
  const playWin = () => soundEnabled && soundEngine.playWinSound();
  const playCashout = () => soundEnabled && soundEngine.playCashoutSound();
  const playLose = () => soundEnabled && soundEngine.playLoseSound();
  const playTakeoff = () => soundEnabled && soundEngine.playTakeoffSound();
  const playFlyAway = () => soundEnabled && soundEngine.playFlyAwaySound();
  const playTick = (isUrgent) => soundEnabled && soundEngine.playTickSound(isUrgent);
  const playDragon = () => soundEnabled && soundEngine.playDragonSound();
  const playTiger = () => soundEnabled && soundEngine.playTigerSound();
  const playTie = () => soundEnabled && soundEngine.playTieSound();

  return (
    <AudioContext.Provider
      value={{
        soundEnabled,
        musicEnabled,
        toggleSound,
        toggleMusic,
        playChip,
        playCard,
        playDiceShake,
        playDiceRoll,
        playGem,
        playBomb,
        playWin,
        playCashout,
        playLose,
        playTakeoff,
        playFlyAway,
        playTick,
        playDragon,
        playTiger,
        playTie,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
