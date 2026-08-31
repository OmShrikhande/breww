import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bomb, CheckCircle2, TrendingUp, RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';

import GameLayout from '../GameLayout';
import { useWallet } from '../../hooks/useWallet';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../utils/formatCurrency';
import { navigateTo } from '../../lib/navigation';
import MineGrid from './MineGrid';
import MineControls from './MineControls';
import {
  getActiveMinesSession,
  startMinesGame,
  revealMinesTile,
  cashoutMines,
  abandonMinesGame,
} from '../../api/minesApi';

// Sound asset imports
import safeSoundUrl from '../../assets/sounds/safe.wav';
import loseSoundUrl from '../../assets/sounds/lose.wav';
import cashoutSoundUrl from '../../assets/sounds/cashout.wav';

const GRID_SIZE = 25;
const ACCENT = '#10B981';

const playAudio = (url, soundEnabled = true) => {
  if (!soundEnabled || !url) return;
  try {
    const audio = new Audio(url);
    audio.volume = 0.6;
    audio.play().catch(() => {});
  } catch {
    // Audio playback fallback
  }
};

const buildTiles = (revealed = [], minePositions = [], ended = false, hitIndex = null) =>
  Array.from({ length: GRID_SIZE }, (_, i) => {
    if (hitIndex === i) return 'mine';
    if (minePositions.includes(i)) return ended ? 'mine-revealed' : 'hidden';
    if (revealed.includes(i)) return 'safe';
    return ended ? 'gem-revealed' : 'hidden';
  });

const Mines = () => {
  const { balance, loading: walletLoading, refreshBalance, setBalance } = useWallet();
  const { isAuthenticated } = useAuth();

  const [mineCount, setMineCount] = useState(3);
  const [betAmount, setBetAmount] = useState(50);
  const [gameStatus, setGameStatus] = useState('idle');
  const [sessionId, setSessionId] = useState(null);
  const [tiles, setTiles] = useState(() => buildTiles());
  const [revealedCount, setRevealedCount] = useState(0);
  const [multiplier, setMultiplier] = useState(1.0);
  const [nextMult, setNextMult] = useState(null);
  const [lastWin, setLastWin] = useState(null);
  const [lastWinMult, setLastWinMult] = useState(1.0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeBet, setActiveBet] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const applySession = useCallback((session) => {
    if (!session) return;
    setSessionId(Number(session.sessionId));
    setMineCount(session.mineCount);
    setActiveBet(session.betAmount);
    setBetAmount(session.betAmount);
    setRevealedCount(session.revealedCount || 0);
    setMultiplier(session.multiplier || 1.0);
    setNextMult(session.nextMultiplier ?? null);
    setGameStatus(session.status === 'playing' ? 'playing' : 'idle');
    setTiles(buildTiles(session.revealedTiles || [], session.minePositions || []));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    getActiveMinesSession()
      .then((s) => {
        if (s && s.status === 'playing') applySession(s);
      })
      .catch(() => {});
  }, [isAuthenticated, applySession]);

  const resetBoard = () => {
    setSessionId(null);
    setGameStatus('idle');
    setTiles(buildTiles());
    setRevealedCount(0);
    setMultiplier(1.0);
    setNextMult(null);
    setActiveBet(0);
    setLastWin(null);
  };

  const handleAbandon = async () => {
    setLoading(true);
    setError('');
    try {
      await abandonMinesGame();
      resetBoard();
      await refreshBalance();
    } catch (e) {
      setError(e.message || 'Could not reset game');
    } finally {
      setLoading(false);
    }
  };

  const startGame = async (amount) => {
    if (!isAuthenticated) {
      navigateTo('/login');
      return;
    }
    if (walletLoading) {
      setError('Loading wallet…');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await startMinesGame({ amount, mineCount });
      if (data.balance !== undefined) setBalance(data.balance);
      setSessionId(Number(data.sessionId));
      setActiveBet(amount);
      setGameStatus('playing');
      setTiles(buildTiles());
      setRevealedCount(0);
      setMultiplier(1.0);
      setNextMult(data.nextMultiplier);
      setLastWin(null);
      await refreshBalance();
    } catch (e) {
      const msg = e.message || 'Could not start game';
      if (msg.includes('current game')) {
        try {
          await abandonMinesGame();
          const retry = await startMinesGame({ amount, mineCount });
          if (retry.balance !== undefined) setBalance(retry.balance);
          setSessionId(Number(retry.sessionId));
          setActiveBet(amount);
          setGameStatus('playing');
          setTiles(buildTiles());
          setRevealedCount(0);
          setMultiplier(1.0);
          setNextMult(retry.nextMultiplier);
          await refreshBalance();
          return;
        } catch {
          // Fall through
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleTileClick = async (tileIndex) => {
    if (!sessionId || gameStatus !== 'playing' || loading) return;

    setLoading(true);
    setError('');
    try {
      const data = await revealMinesTile(sessionId, tileIndex);

      if (data.hitMine) {
        playAudio(loseSoundUrl, soundEnabled);
        setGameStatus('ended');
        setTiles(buildTiles(data.revealedTiles, data.minePositions, true, data.hitTileIndex ?? tileIndex));
        await refreshBalance();
        setTimeout(resetBoard, 3000);
        return;
      }

      playAudio(safeSoundUrl, soundEnabled);
      setRevealedCount(data.revealedCount);
      setMultiplier(data.multiplier);
      setNextMult(data.nextMultiplier ?? null);
      setTiles(buildTiles(data.revealedTiles));
    } catch (e) {
      setError(e.message || 'Reveal failed');
    } finally {
      setLoading(false);
    }
  };

  const cashOut = async () => {
    if (!sessionId || gameStatus !== 'playing' || revealedCount === 0 || loading) return;

    setLoading(true);
    setError('');
    try {
      const data = await cashoutMines(sessionId);
      playAudio(cashoutSoundUrl, soundEnabled);
      setGameStatus('ended');
      setLastWin(data.payout);
      setLastWinMult(multiplier);
      if (data.minePositions) {
        setTiles(buildTiles(data.revealedTiles || [], data.minePositions, true));
      }
      if (data.balance !== undefined) setBalance(data.balance);
      await refreshBalance();
      setTimeout(resetBoard, 3000);
    } catch (e) {
      setError(e.message || 'Cashout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GameLayout
      title="Mines"
      subtitle="Reveal gems · avoid bombs"
      accent={ACCENT}
      hideBetPanel
      isWide
    >
      <div className="flex flex-col justify-between h-full max-w-md mx-auto w-full gap-2 select-none">
        {/* Status Banner */}
        <div className="game-glass rounded-xl border border-white/10 p-2.5 flex items-center justify-between bg-black/40 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-base">
              💎
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Provably Fair</p>
              <p className="text-xs text-white/70 font-bold">
                {gameStatus === 'playing' ? `Stake: ${formatINR(activeBet)} · ${mineCount} Mines` : 'Select mines & stake'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSoundEnabled((v) => !v)}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute audio' : 'Enable audio'}
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>

            {gameStatus === 'playing' && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-casino-gold/15 border border-casino-gold/30 text-casino-gold text-xs font-black tabular-nums">
                <TrendingUp size={13} />
                <span>{multiplier.toFixed(2)}×</span>
              </div>
            )}

            {(gameStatus === 'playing' || gameStatus === 'idle') && sessionId && (
              <button
                type="button"
                onClick={handleAbandon}
                disabled={loading}
                className="p-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
                title="Reset game"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </div>

        {error && (
          <p className="text-center text-xs text-red-400 bg-red-500/15 border border-red-500/30 rounded-xl py-1.5 px-3 font-bold animate-fadeIn">
            {error}
          </p>
        )}

        {/* 5x5 Grid (Compact responsive) */}
        <div className="flex-1 flex items-center justify-center my-auto min-h-0">
          <MineGrid tiles={tiles} onTileClick={handleTileClick} gameStatus={gameStatus} />
        </div>

        {/* Action Controls */}
        <MineControls
          gameStatus={gameStatus}
          betAmount={betAmount}
          activeBet={activeBet}
          setBetAmount={setBetAmount}
          mineCount={mineCount}
          setMineCount={setMineCount}
          onStart={startGame}
          onCashout={cashOut}
          revealedCount={revealedCount}
          multiplier={multiplier}
          nextMultiplier={nextMult}
          balance={balance}
          walletLoading={walletLoading}
          loading={loading}
        />

        {/* Win Celebration Popup */}
        <AnimatePresence>
          {lastWin != null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 border-2 border-emerald-300 p-6 text-center shadow-2xl text-white max-w-xs w-full">
                <div className="inline-flex p-3 rounded-full bg-white/20 mb-2">
                  <Sparkles size={26} className="text-amber-300" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Cashed Out!</p>
                <p className="text-3xl font-black tracking-tight mt-1">{formatINR(lastWin)}</p>
                <p className="text-xs font-bold text-emerald-100 mt-1">{lastWinMult.toFixed(2)}× Multiplier 💎</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Explosion Loss Banner */}
        {gameStatus === 'ended' && lastWin == null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-gradient-to-r from-red-600 to-rose-800 border-2 border-red-400 p-3 text-center shadow-xl text-white"
          >
            <Bomb size={24} className="inline text-amber-300 mb-0.5" />
            <p className="text-sm font-black uppercase tracking-wider">BOOM! Mine Exploded</p>
            <p className="text-[10px] font-bold text-red-200">Starting new board…</p>
          </motion.div>
        )}
      </div>
    </GameLayout>
  );
};

export default Mines;
