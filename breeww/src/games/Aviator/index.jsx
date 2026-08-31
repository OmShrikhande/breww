import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import GameLayout from '../GameLayout';
import { useWallet } from '../../hooks/useWallet';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../utils/formatCurrency';
import { navigateTo } from '../../lib/navigation';
import { getAviatorState, placeAviatorBet, cashoutAviator } from '../../api/aviatorApi';
import { useAviatorWebSocket } from '../../hooks/useAviatorWebSocket';
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

  // REST polling for initial sync & fallback
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
        if (data.myBet) setMyBet(data.myBet);
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

  // WebSocket Live Real-Time Events
  const handleWsFlightTick = useCallback((msg) => {
    setPhase('flying');
    if (msg.roundId) setRoundId(msg.roundId);
    setMultiplier(msg.multiplier);
    flightSyncRef.current = { elapsed: msg.flightElapsed, receivedAt: Date.now() };
    if (myBet && myBet.status === 'active' && !hasCashedOut) {
      setCanCashout(true);
    }
  }, [myBet, hasCashedOut]);

  const handleWsPhaseChange = useCallback((msg) => {
    setPhase(msg.phase);
    if (msg.roundId) setRoundId(msg.roundId);

    if (msg.phase === 'flying') {
      flightSyncRef.current = { elapsed: 0, receivedAt: Date.now() };
      setMultiplier(1.00);
      setDisplayTimer(0);
      if (myBet && myBet.status === 'active' && !hasCashedOut) {
        setCanCashout(true);
      }
    } else if (msg.phase === 'crashed') {
      const finalCrash = Number(msg.crashPoint || 1.5);
      setMultiplier(finalCrash);
      setCrashPoint(finalCrash);
      setCanCashout(false);
      setHistory((prev) => [{ id: Date.now(), multiplier: finalCrash }, ...prev.slice(0, 19)]);
    } else if (msg.phase === 'betting') {
      const sLeft = Number(msg.timerLeft ?? 15);
      timerSyncRef.current = { left: sLeft, receivedAt: Date.now() };
      setDisplayTimer(sLeft);
      setMultiplier(1.00);
      setHasCashedOut(false);
      setCashoutMult(null);
      setCashoutPayout(null);
      isCashingOutRef.current = false;
      setMyBet(null);
      setCanCashout(false);
    }
  }, [myBet, hasCashedOut]);

  const handleWsNewBet = useCallback((bet) => {
    setRoundBets((prev) => [bet, ...prev.slice(0, 49)]);
  }, []);

  const handleWsNewCashout = useCallback((bet) => {
    setRoundBets((prev) =>
      prev.map((b) => (b.user === bet.user ? { ...b, hasCashedOut: true, cashoutMult: bet.multiplier, payout: bet.payout } : b))
    );
  }, []);

  const handleWsMyBetConfirmed = useCallback((data) => {
    setMyBet({ amount: data.amount, status: 'active' });
    setHasCashedOut(false);
    setCashoutMult(null);
    setCashoutPayout(null);
    if (data.balance !== undefined) setBalance(data.balance);
  }, [setBalance]);

  const handleWsMyCashoutConfirmed = useCallback((data) => {
    setHasCashedOut(true);
    setCashoutMult(data.multiplier);
    setCashoutPayout(data.payout);
    if (data.balance !== undefined) setBalance(data.balance);
  }, [setBalance]);

  // Hook up WebSocket
  const { isConnected } = useAviatorWebSocket({
    onFlightTick: handleWsFlightTick,
    onPhaseChange: handleWsPhaseChange,
    onNewBet: handleWsNewBet,
    onNewCashout: handleWsNewCashout,
    onMyBetConfirmed: handleWsMyBetConfirmed,
    onMyCashoutConfirmed: handleWsMyCashoutConfirmed,
  });

  useEffect(() => {
    pollState();
    const t = setInterval(pollState, 3000);
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
    } catch (e) {
      setError(e.message || 'Bet failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, balance, bettingOpen, isBetPlaced, setBalance, refreshBalance]);

  const handleCashout = useCallback(async () => {
    const targetRoundId = roundId || activeRoundRef.current;
    if (!targetRoundId || loading || hasCashedOut || isCashingOutRef.current) return;

    isCashingOutRef.current = true;
    setLoading(true);
    setError('');
    try {
      const currentClickMult = multiplier;
      const data = await cashoutAviator(targetRoundId, currentClickMult);
      const finalMult = Number(data.multiplier || currentClickMult);
      const finalPayout = Number(data.payout || (betAmount * finalMult));

      setHasCashedOut(true);
      setCashoutMult(finalMult);
      setCashoutPayout(finalPayout);
      if (data.balance !== undefined) {
        setBalance(data.balance);
      }
      await refreshBalance();
    } catch (e) {
      isCashingOutRef.current = false;
      setError(e.message || 'Cashout failed. Plane may have crashed.');
    } finally {
      setLoading(false);
    }
  }, [roundId, loading, hasCashedOut, multiplier, betAmount, setBalance, refreshBalance]);

  return (
    <GameLayout title="AVIATOR" isWide hideBetPanel hideHeader>
      <div className="flex flex-col h-full bg-black w-full overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#1c1c1e] border-b border-white/5 shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigateTo('/')}
              className="p-2 rounded-xl hover:bg-white/10 text-white/80 transition-colors cursor-pointer"
              aria-label="Back to home"
            >
              <ChevronLeft size={22} />
            </button>
            <span className="text-red-600 font-black text-2xl italic tracking-tighter uppercase">Aviator</span>
            <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-200">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {isConnected ? 'Real-Time WebSocket' : 'Connecting…'} · {betWindowSeconds}s Rounds
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
              <span className="text-xs text-gray-400">Balance:</span>
              <span className="text-xs font-black text-emerald-400 tabular-nums">{formatINR(balance)}</span>
            </div>
          </div>
        </div>

        {/* Multiplier History Strip */}
        <AviatorHistory history={history} />

        {/* Main Arena */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          {/* Left Sidebar (Desktop) */}
          <div className="hidden lg:flex w-[280px] shrink-0 border-r border-white/5 bg-[#121214] flex-col overflow-hidden">
            <AviatorSidebar roundBets={roundBets} myBets={myBetsList} topWinners={topWinners} />
          </div>

          {/* Center Stage & Controls */}
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-black">
            {/* Flight Graph Visualizer */}
            <div className="flex-1 relative min-h-0 bg-[#000000] overflow-hidden">
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
                activeBetAmount={myBet?.amount || betAmount}
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
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#28a745] text-white px-6 py-2.5 rounded-full font-black text-sm shadow-[0_0_20px_rgba(40,167,69,0.6)] flex items-center gap-2"
          >
            ✓ Bet Placed for Round #{roundId}
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Cashout Celebration Overlay */}
      <AnimatePresence>
        {hasCashedOut && cashoutMult && (
          <Motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            className="fixed top-28 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 to-green-700 text-white px-8 py-4 rounded-3xl font-black text-center shadow-[0_0_40px_rgba(16,185,129,0.7)] border-2 border-emerald-400"
          >
            <div className="text-xs uppercase tracking-widest text-emerald-200 mb-0.5">Cashed Out At</div>
            <div className="text-3xl font-black tabular-nums">{cashoutMult.toFixed(2)}x</div>
            <div className="text-sm font-bold text-white mt-1">
              {formatINR(cashoutPayout || (betAmount * cashoutMult))}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-red-600/95 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-2xl border border-red-400 animate-fadeIn">
          {error}
        </div>
      )}
    </GameLayout>
  );
};

export default Aviator;
