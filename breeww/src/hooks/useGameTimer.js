import { useState, useEffect, useCallback } from 'react';

const useGameTimer = (initialTime = 30) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isPaused, setIsPaused] = useState(false);
  const [isRoundOver, setIsRoundOver] = useState(false);

  const resetTimer = useCallback(() => {
    setTimeLeft(initialTime);
    setIsRoundOver(false);
    setIsPaused(false);
  }, [initialTime]);

  useEffect(() => {
    if (isPaused || isRoundOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRoundOver(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, isRoundOver]);

  return {
    timeLeft,
    isRoundOver,
    resetTimer,
    setIsPaused,
  };
};

export default useGameTimer;
