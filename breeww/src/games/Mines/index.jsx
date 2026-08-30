import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bomb, CheckCircle2, TrendingUp, RotateCcw } from 'lucide-react';

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

const GRID_SIZE = 25;
const ACCENT = '#64748B';

const buildTiles = (revealed = [], minePositions = [], ended = false, hitIndex = null) =>
  Array.from({ length: GRID_SIZE }, (_, i) => {
    if (hitIndex === i) return 'mine';
    if (minePositions.includes(i)) return ended ? 'mine-revealed' : 'hidden';
    if (revealed.includes(i)) return 'safe';
    return 'hidden';
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
  const [multiplier, setMultiplier] = useState(1);
  const [nextMult, setNextMult] = useState(null);
  const [lastWin, setLastWin] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeBet, setActiveBet] = useState(0);

  const applySession = useCallback((session) => {
    if (!session) return;
    setSessionId(Number(session.sessionId));
    setMineCount(session.mineCount);
    setActiveBet(session.betAmount);
    setBetAmount(session.betAmount);
    setRevealedCount(session.revealedCount || 0);
    setMultiplier(session.multiplier || 1);
    setNextMult(session.nextMultiplier ?? null);
    setGameStatus(session.status === 'playing' ? 'playing' : 'idle');
    setTiles(buildTiles(session.revealedTiles || [], session.minePositions || []));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    getActiveMinesSession()
      .then((s) => { if (s) applySession(s); })
      .catch(() => {});
  }, [isAuthenticated, applySession]);

  const resetBoard = () => {
    setSessionId(null);
    setGameStatus('idle');
    setTiles(buildTiles());
    setRevealedCount(0);
    setMultiplier(1);
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
      setBalance(data.balance);
      setSessionId(Number(data.sessionId));
      setActiveBet(amount);
      setGameStatus('playing');
      setTiles(buildTiles());
      setRevealedCount(0);
      setMultiplier(1);
      setNextMult(data.nextMultiplier);
      setLastWin(null);
    } catch (e) {
      const msg = e.message || 'Could not start game';
      if (msg.includes('current game')) {
        try {
          await abandonMinesGame();
          const data = await startMinesGame({ amount, mineCount });
          setBalance(data.balance);
          setSessionId(Number(data.sessionId));
          setActiveBet(amount);
          setGameStatus('playing');
          setTiles(buildTiles());
          setRevealedCount(0);
          setMultiplier(1);
          setNextMult(data.nextMultiplier);
          setLastWin(null);
          return;
        } catch (retryErr) {
          setError(retryErr.message || msg);
        }
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTileClick = async (index) => {
    if (gameStatus !== 'playing' || !sessionId || loading) return;

    setLoading(true);
    setError('');
    try {
      const data = await revealMinesTile({ sessionId, tileIndex: index });

      if (data.hitMine) {
        setTiles(buildTiles(data.revealedTiles, data.minePositions, true, index));
        setGameStatus('ended');
        setBalance(data.balance);
        await refreshBalance();
        setTimeout(resetBoard, 2500);
        return;
      }

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
      setGameStatus('ended');
      setLastWin(data.payout);
      if (data.minePositions) {
        setTiles(buildTiles(data.revealedTiles || [], data.minePositions, true));
      }
      setBalance(data.balance);
      await refreshBalance();
      setTimeout(resetBoard, 2500);
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
      <div className="flex flex-col gap-4 pb-6 max-w-lg mx-auto w-full">
        <div className="game-glass rounded-2xl border border-white/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-600/30 flex items-center justify-center text-xl">💣</div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Live · Server-side</p>
              <p className="text-xs text-white/50">
                {gameStatus === 'playing' ? `Active bet ${formatINR(activeBet)}` : 'Pick mines & bet to start'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {gameStatus === 'playing' && (
              <div className="flex items-center gap-1.5 text-casino-gold">
                <TrendingUp size={16} />
                <span className="font-black tabular-nums">{multiplier.toFixed(2)}×</span>
              </div>
            )}
            {(gameStatus === 'playing' || gameStatus === 'idle') && sessionId && (
              <button
                type="button"
                onClick={handleAbandon}
                disabled={loading}
                className="p-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/30"
                title="Reset stuck game"
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>
        </div>

        {error && (
          <p className="text-center text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl py-2 px-3">
            {error}
          </p>
        )}

        <MineGrid tiles={tiles} onTileClick={handleTileClick} gameStatus={gameStatus} />

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

        <AnimatePresence>
          {lastWin != null && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl bg-gradient-to-r from-emerald-600/90 to-green-700/90 border border-emerald-400/50 p-4 text-center shadow-glow"
            >
              <CheckCircle2 size={24} className="inline text-white mb-1" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">You won</p>
              <p className="text-2xl font-black text-white">{formatINR(lastWin)}</p>
              <p className="text-xs text-white/60 mt-1">{multiplier.toFixed(2)}× multiplier</p>
            </motion.div>
          )}
        </AnimatePresence>

        {gameStatus === 'ended' && lastWin == null && (
          <div className="rounded-2xl bg-red-500/15 border border-red-500/40 p-4 text-center">
            <Bomb size={28} className="inline text-red-400 mb-1" />
            <p className="font-black text-red-300 uppercase tracking-wider">Boom! You hit a mine</p>
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default Mines;
