import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import GameLayout from '../GameLayout';
import { useWallet } from '../../hooks/useWallet';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../utils/formatCurrency';
import { navigateTo } from '../../lib/navigation';
import { getAviatorState, placeAviatorBet, cashoutAviator } from '../../api/aviatorApi';
import AviatorGraph from './AviatorGraph';
import AviatorControls from './AviatorControls';
import AviatorHistory from './AviatorHistory';
import AviatorSidebar from './AviatorSidebar';

const MULTIPLIER_GROWTH_RATE = 0.048;

const calcMultiplier = (elapsedSec) => {
  if (!elapsedSec || elapsedSec <= 0) return 1.00;
  return Math.max(1.00, Math.floor(Math.pow(Math.E, MULTIPLIER_GROWTH_RATE * Math.max(0, elapsedSec)) * 100) / 100);
};

const Aviator = () => {
  const { balance, refreshBalance, setBalance } = useWallet();
  const { isAuthenticated } = useAuth();

  const [phase, setPhase] = useState('betting');
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashPoint, setCrashPoint] = useState(null);
  const [roundId, setRoundId] = useState(null);
  const [displayTimer, setDisplayTimer] = useState(15);
  const [betWindowSeconds, setBetWindowSeconds] = useState(15);
  const [serverBettingOpen, setServerBettingOpen] = useState(true);
  const [history, setHistory] = useState([]);
  const [recentWinners, setRecentWinners] = useState([]);
  const [topWinners, setTopWinners] = useState([]);
  const [roundBets, setRoundBets] = useState([]);
  const [betAmount, setBetAmount] = useState(50);
  const [myBet, setMyBet] = useState(null);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [cashoutMult, setCashoutMult] = useState(null);
  const [cashoutPayout, setCashoutPayout] = useState(null);
  const [canCashout, setCanCashout] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBetSuccess, setShowBetSuccess] = useState(false);
  
  const timerSyncRef = useRef({ left: 15, receivedAt: Date.now() });
  const flightSyncRef = useRef({ elapsed: 0, receivedAt: Date.now() });
  const activeRoundRef = useRef(null);
  const isCashingOutRef = useRef(false);

  const isBetPlaced = Boolean(myBet && myBet.status === 'active');
  const bettingOpen = phase === 'betting' && (displayTimer > 0 || serverBettingOpen);

  const visualState =
    phase === 'flying' ? 'running'
      : phase === 'crashed' ? 'crashed'
        : 'waiting';

  const myBetsList = useMemo(() => {
    if (!myBet) return [];
    return [{
      id: 'my-bet',
      user: 'You',
      isMe: true,
      amount: Number(myBet.amount),
      hasCashedOut: hasCashedOut || myBet.status === 'cashed_out',
      cashoutMult: cashoutMult || Number(myBet.cashoutMultiplier) || 0,
      payout: cashoutPayout || Number(myBet.payout) || 0,
    }];
  }, [myBet, hasCashedOut, cashoutMult, cashoutPayout]);

  const pollState = useCallback(async () => {
    try {
      const data = await getAviatorState();
      setError('');
      setPhase(data.phase || 'betting');
      setBetWindowSeconds(data.betWindowSeconds ?? 15);
      setServerBettingOpen(Boolean(data.bettingOpen));
      setCrashPoint(data.crashPoint != null ? Number(data.crashPoint) : null);
      setCanCashout(Boolean(data.canCashout || (data.phase === 'flying' && myBet?.status === 'active')));
      setRecentWinners(data.recentWinners || []);
      setTopWinners(data.topWinners || []);
      setRoundBets(data.roundBets || []);
      setHistory((data.history || []).map((h, i) => ({ id: h.id || i, multiplier: Number(h.multiplier) || 1 })));

      // Detect round transition first
      if (data.roundId && data.roundId !== activeRoundRef.current) {
        activeRoundRef.current = data.roundId;
        setRoundId(data.roundId);
        setHasCashedOut(false);
        setCashoutMult(null);
        setCashoutPayout(null);
        isCashingOutRef.current = false;
        setMyBet(data.myBet || null);
      } else {
        if (data.roundId) setRoundId(data.roundId);
        setMyBet(data.myBet || null);
      }

      // Synchronize timer reference
      if (data.phase === 'betting') {
        const sLeft = Number(data.timerLeft ?? 15);
        timerSyncRef.current = { left: sLeft, receivedAt: Date.now() };
        setDisplayTimer(sLeft);
        setMultiplier(1.00);
      } else {
        setDisplayTimer(0);
      }

      // Synchronize flight multiplier reference
      if (data.phase === 'flying') {
        const serverElapsed = Number(data.flightElapsed || 0);
        flightSyncRef.current = { elapsed: serverElapsed, receivedAt: Date.now() };
      } else if (data.phase === 'crashed') {
        const finalCrash = Number(data.crashPoint || data.multiplier || 1.5);
        setMultiplier(finalCrash);
      } else {
        setMultiplier(1.00);
      }

      if (data.myBet?.status === 'cashed_out') {
        setHasCashedOut(true);
        setCashoutMult(Number(data.myBet.cashoutMultiplier));
        setCashoutPayout(Number(data.myBet.payout));
      }
    } catch (e) {
      if (e?.message?.includes('Too many requests')) {
        setError('Connection busy — retrying…');
      }
    }
  }, [myBet]);

  useEffect(() => {
    pollState();
    const t = setInterval(pollState, 1000);
    return () => clearInterval(t);
  }, [pollState]);

  // Smooth local countdown timer (200ms tick)
  useEffect(() => {
    if (phase !== 'betting') {
      setDisplayTimer(0);
      return undefined;
    }

    const tick = () => {
      const elapsed = Math.floor((Date.now() - timerSyncRef.current.receivedAt) / 1000);
      const remaining = Math.max(0, timerSyncRef.current.left - elapsed);
      setDisplayTimer(remaining);
    };

    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [phase, roundId]);

  // High performance 60FPS Flight animation loop
  useEffect(() => {
    if (phase !== 'flying') return undefined;

    let frameId;
    const updateFlight = () => {
      const deltaSec = (Date.now() - flightSyncRef.current.receivedAt) / 1000;
      const currentElapsed = Math.max(0, flightSyncRef.current.elapsed + deltaSec);
      let currentMult = calcMultiplier(currentElapsed);

      if (crashPoint && currentMult >= crashPoint) {
        currentMult = crashPoint;
      }
      setMultiplier(currentMult);
      frameId = requestAnimationFrame(updateFlight);
    };

    frameId = requestAnimationFrame(updateFlight);
    return () => cancelAnimationFrame(frameId);
  }, [phase, crashPoint]);

  const handlePlaceBet = useCallback(async (amount) => {
    if (!isAuthenticated) {
      navigateTo('/login');
      return;
    }

    if (!amount || amount < 10) {
      setError('Minimum bet amount is ₹10');
      return;
    }

    if (amount > balance) {
      setError(`Insufficient balance. Your balance is ${formatINR(balance)}.`);
      return;
    }

    if (!bettingOpen || isBetPlaced) {
      setError('Betting window is closed for this round. Next round starting soon.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const data = await placeAviatorBet(amount);
      if (data.balance !== undefined) {
        setBalance(data.balance);
      }
      if (data.roundId) {
        setRoundId(data.roundId);
        activeRoundRef.current = data.roundId;
      }
      setMyBet({ amount, status: 'active' });
      setHasCashedOut(false);
      setCashoutMult(null);
      setCashoutPayout(null);
      isCashingOutRef.current = false;
      setShowBetSuccess(true);
      setTimeout(() => setShowBetSuccess(false), 2200);
      await refreshBalance();
      await pollState();
    } catch (e) {
      setError(e.message || 'Bet failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, balance, bettingOpen, isBetPlaced, setBalance, refreshBalance, pollState]);

  const handleCashout = useCallback(async () => {
    const targetRoundId = roundId || activeRoundRef.current;
    if (!targetRoundId || loading || hasCashedOut || isCashingOutRef.current) return;

    isCashingOutRef.current = true;
    setLoading(true);
    setError('');
    try {
      const data = await cashoutAviator(targetRoundId);
      setHasCashedOut(true);
      setCashoutMult(data.multiplier || multiplier);
      setCashoutPayout(data.payout || (betAmount * (data.multiplier || multiplier)));
      if (data.balance !== undefined) {
        setBalance(data.balance);
      }
      await refreshBalance();
      await pollState();
    } catch (e) {
      isCashingOutRef.current = false;
      setError(e.message || 'Cashout failed. Plane may have crashed.');
    } finally {
      setLoading(false);
    }
  }, [roundId, loading, hasCashedOut, multiplier, betAmount, setBalance, refreshBalance, pollState]);

  return (
    <GameLayout title="AVIATOR" isWide hideBetPanel hideHeader>
      <div className="flex flex-col h-full bg-black w-full overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#1c1c1e] border-b border-white/5 shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigateTo('/')}
              className="p-2 rounded-xl hover:bg-white/10 text-white/80 transition-colors"
              aria-label="Back to home"
            >
              <ChevronLeft size={22} />
            </button>
            <span className="text-red-600 font-black text-2xl italic tracking-tighter uppercase">Aviator</span>
            <div className="hidden md:flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-200">
              Live Room · {betWindowSeconds}s Rounds
            </div>
          </div>
          <div className="flex items-center gap-4">
            {phase === 'betting' && (
              <span className={`text-sm font-black uppercase tabular-nums ${displayTimer <= 5 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
                Bet {displayTimer}s
              </span>
            )}
            {phase === 'flying' && (
              <span className="text-[10px] font-black text-red-400 uppercase animate-pulse">Flying</span>
            )}
            <div className="flex items-center gap-2 bg-[#0b1024] px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-green-400 font-black text-base tabular-nums">{balance.toFixed(2)}</span>
              <span className="text-gray-400 text-[10px] font-bold uppercase">INR</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/15 border-b border-red-500/30 text-center py-2 px-4 text-xs font-bold text-red-200 shrink-0 animate-fadeIn">
            {error}
          </div>
        )}

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Left Desktop Sidebar */}
          <div className="hidden lg:flex lg:w-[380px] xl:w-[420px] shrink-0 h-full overflow-hidden border-r border-white/5">
            <AviatorSidebar
              allBets={roundBets}
              myBets={myBetsList}
              topBets={topWinners}
            />
          </div>

          <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto custom-scrollbar bg-[#000000]">
            {/* Mobile Sidebar */}
            <div className="lg:hidden shrink-0 h-[220px] border-b border-white/5">
              <AviatorSidebar
                allBets={roundBets}
                myBets={myBetsList}
                topBets={topWinners}
              />
            </div>

            <AviatorHistory history={history} />

            {/* Flight Graph */}
            <div className="flex-1 relative aspect-video lg:aspect-auto min-h-[260px] md:min-h-[360px] bg-[#000000] overflow-hidden">
              <AviatorGraph
                multiplier={multiplier}
                gameState={visualState}
                roundId={roundId}
                timerLeft={displayTimer}
                betWindowSeconds={betWindowSeconds}
                recentWinners={recentWinners}
                waitingMessage={
                  phase === 'betting'
                    ? `Place your bet · ${displayTimer}s left`
                    : phase === 'crashed'
                      ? `Crashed at ${(crashPoint || multiplier).toFixed(2)}x`
                      : 'Next round starting…'
                }
              />
            </div>

            {/* Bottom Controls */}
            <div className="w-full shrink-0 p-3 bg-[#0a0a0a] border-t border-white/5">
              <AviatorControls
                betAmount={betAmount}
                setBetAmount={setBetAmount}
                onPlaceBet={handlePlaceBet}
                onCashout={handleCashout}
                gameState={visualState}
                isBetPlaced={isBetPlaced}
                hasCashedOut={hasCashedOut}
                multiplier={multiplier}
                loading={loading}
                bettingOpen={bettingOpen}
                canCashout={canCashout}
                balance={balance}
                isAuthenticated={isAuthenticated}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bet Placed Success Popup */}
      <AnimatePresence>
        {showBetSuccess && (
          <Motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-[#28a745] px-10 py-5 rounded-2xl font-black text-white uppercase tracking-widest border-2 border-green-300 shadow-[0_10px_30px_rgba(40,167,69,0.5)]">
              Bet Locked In · Plane Launches Soon ✈️
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Cashout Win Popup */}
      <AnimatePresence>
        {hasCashedOut && cashoutPayout != null && (
          <Motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0, y: -20 }}
            className="fixed inset-0 pointer-events-none flex items-center justify-center z-[70]"
          >
            <div className="bg-[#28a745] px-10 py-6 rounded-3xl border-2 border-green-300 text-center shadow-[0_15px_40px_rgba(40,167,69,0.6)]">
              <div className="text-white text-xs font-black uppercase tracking-widest mb-1">Cashed out at</div>
              <div className="text-5xl font-black text-white italic tracking-tight">{(cashoutMult || multiplier).toFixed(2)}x</div>
              <div className="text-white font-black text-2xl mt-1">{formatINR(cashoutPayout)}</div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </GameLayout>
  );
};

export default Aviator;
