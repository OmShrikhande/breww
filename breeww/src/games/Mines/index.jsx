import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Wallet, History, CheckCircle2, Info, TrendingUp } from 'lucide-react';
import GameLayout from '../GameLayout';
import { useWallet } from '../../hooks/useWallet';
import { useBets } from '../../hooks/useBets';
import { formatINR } from '../../utils/formatCurrency';
import MineGrid from './MineGrid';
import MineControls from './MineControls';

const Mines = () => {
  const { balance } = useWallet();
  const { bets, addBet, clearBets, totalBetAmount } = useBets();

  // Game State
  const [mineCount, setMineCount] = useState(3);
  const [betAmount, setBetAmount] = useState(100);
  const [gameStatus, setGameStatus] = useState('idle'); // 'idle', 'playing', 'ended'
  const [tiles, setTiles] = useState(Array(25).fill('hidden'));
  const [minePositions, setMinePositions] = useState([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const multiplier = useMemo(() => {
    if (revealedCount === 0) return 1;
    const mineBonus = mineCount / 3;
    return 1 + (revealedCount * 0.2 * mineBonus);
  }, [revealedCount, mineCount]);
  const [lastWin, setLastWin] = useState(null);
  const [autoGame, setAutoGame] = useState(false);

  const calculateMultiplier = useCallback((opened) => {
    if (opened === 0) return 1;
    const mineBonus = mineCount / 3;
    return 1 + (opened * 0.2 * mineBonus);
  }, [mineCount]);

  const startGame = useCallback((amount) => {
    if (amount <= 0) return;

    // Generate preview board state
    const newMines = [];
    while (newMines.length < mineCount) {
      const pos = Math.floor(Math.random() * 25);
      if (!newMines.includes(pos)) newMines.push(pos);
    }

    setMinePositions(newMines);
    setTiles(Array(25).fill('hidden'));
    setRevealedCount(0);
    setGameStatus('playing');
    setLastWin(null);
    
    addBet({
      type: 'mines-preview',
      amount,
      mines: mineCount,
      source: 'frontend-preview'
    });
  }, [mineCount, addBet]);

  const handleTileClick = (index) => {
    if (gameStatus !== 'playing' || tiles[index] !== 'hidden') return;

    if (minePositions.includes(index)) {
      // Hit a mine!
      const newTiles = [...tiles];
      minePositions.forEach(pos => {
        newTiles[pos] = pos === index ? 'mine' : 'mine-revealed';
      });
      setTiles(newTiles);
      setGameStatus('ended');
      setTimeout(() => clearBets(), 2000);
    } else {
      // Safe!
      const newTiles = [...tiles];
      newTiles[index] = 'safe';
      setTiles(newTiles);
      setRevealedCount(prev => prev + 1);
      
      // Auto-win if all safe tiles are found
      if (revealedCount + 1 === 25 - mineCount) {
        cashOut();
      }
    }
  };

  const cashOut = () => {
    if (gameStatus !== 'playing' || revealedCount === 0) return;

    const currentMultiplier = calculateMultiplier(revealedCount);
    const winAmount = betAmount * currentMultiplier;
    
    setLastWin(winAmount);
    setGameStatus('ended');

    // Reveal all mines (as hidden/dimmed)
    const newTiles = [...tiles];
    minePositions.forEach(pos => {
      if (newTiles[pos] === 'hidden') {
        newTiles[pos] = 'mine-revealed';
      }
    });
    setTiles(newTiles);

    setTimeout(() => clearBets(), 3000);
  };

  const handleRandom = () => {
    const opts = [1, 3, 5, 8, 10];
    setMineCount(opts[Math.floor(Math.random() * opts.length)]);
  };

  useEffect(() => {
    if (autoGame && gameStatus === 'ended') {
      const delay = setTimeout(() => {
        if (balance > 0) {
          startGame(Math.max(10, Math.min(100, balance)));
        }
      }, 1500);
      return () => clearTimeout(delay);
    }
  }, [autoGame, gameStatus, balance, startGame]);

  return (
    <GameLayout title="MINES" isWide={true} hideHeader hideBetPanel>
      <div className="bg-gradient-to-br from-[#0f57c7] via-[#0f65e1] to-[#1571ff] min-h-screen text-white p-2 md:p-4">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/20 bg-[#0b3f95]/80 p-3 md:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0e3b90] border border-blue-500/30 rounded-2xl p-2 md:p-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em]">
              <div className="bg-[#143f82] px-2 py-1 rounded-full">MINES</div>
              <div className="bg-[#f7a93b] px-2 py-1 rounded-full text-black">How to Play?</div>
              <div className="bg-sky-300/90 px-2 py-1 rounded-full text-black">Preview</div>
            </div>
            <div className="flex items-center gap-2 text-xs font-black">
              <div className="bg-[#143f82] px-2 py-1 rounded-full">Mines: {mineCount}</div>
              <div className="bg-[#f7a93b] px-2 py-1 rounded-full text-black">Next: {multiplier.toFixed(2)}x</div>
            </div>
            <div className="text-xs font-black">{formatINR(balance)}</div>
          </div>

          <div className="mt-3 rounded-2xl border border-white/20 bg-[#103e9d]/90 p-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="text-xs font-black uppercase tracking-[0.15em] text-slate-200">Mines: {mineCount}</div>
              <div className="flex items-center gap-2">
                <button onClick={handleRandom} className="rounded-xl bg-[#1a4fbd] px-3 py-1 text-xs font-black uppercase">RANDOM</button>
                <button onClick={() => setAutoGame(!autoGame)} className={`rounded-xl px-3 py-1 text-xs font-black uppercase ${autoGame ? 'bg-green-400 text-black' : 'bg-[#1a4fbd] text-white'}`}>
                  Auto Game {autoGame ? 'On' : 'Off'}
                </button>
              </div>
            </div>

            <div className="mt-3">
              <MineGrid tiles={tiles} onTileClick={handleTileClick} gameStatus={gameStatus} />
            </div>

            <div className="mt-3">
              <MineControls 
                gameStatus={gameStatus}
                betAmount={betAmount}
                setBetAmount={setBetAmount}
                mineCount={mineCount}
                setMineCount={setMineCount}
                onStart={startGame}
                onCashout={cashOut}
                revealedCount={revealedCount}
                multiplier={multiplier}
                balance={balance}
              />
            </div>
          </div>

          <AnimatePresence>
            {lastWin && (
              <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-3 rounded-xl bg-green-500/90 p-2 text-center font-black">
                Big Win! {formatINR(lastWin)}
              </Motion.div>
            )}
          </AnimatePresence>

          {bets.length > 0 && (
            <div className="mt-3 rounded-xl border border-white/20 bg-[#0d2a72] p-2 text-xs font-black uppercase tracking-[0.15em]">
              Active Bet: {formatINR(totalBetAmount)}
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  );
};

export default Mines;
