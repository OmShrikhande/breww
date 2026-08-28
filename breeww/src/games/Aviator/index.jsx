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

const calcMult = (startedAt) => {
  if (!startedAt) return 1;
  const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
  return Math.max(1, Math.floor(Math.pow(Math.E, 0.08 * elapsed) * 100) / 100);
};

const Aviator = () => {
  const { balance, refreshBalance, setBalance } = useWallet();
  const { isAuthenticated } = useAuth();

  const [phase, setPhase] = useState('betting');
  const [multiplier, setMultiplier] = useState(1);
  const [crashPoint, setCrashPoint] = useState(null);
  const [roundId, setRoundId] = useState(null);
  const [timerLeft, setTimerLeft] = useState(15);
  const [displayTimer, setDisplayTimer] = useState(15);
  const [betClosesAt, setBetClosesAt] = useState(null);
  const [betWindowSeconds, setBetWindowSeconds] = useState(15);
  const [history, setHistory] = useState([]);
  const [recentWinners, setRecentWinners] = useState([]);
  const [topWinners, setTopWinners] = useState([]);
  const [roundBets, setRoundBets] = useState([]);
  const [betAmount, setBetAmount] = useState(50);
  const [myBet, setMyBet] = useState(null);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [cashoutMult, setCashoutMult] = useState(null);
  const [cashoutPayout, setCashoutPayout] = useState(null);
  const [flyingStartedAt, setFlyingStartedAt] = useState(null);
  const [canCashout, setCanCashout] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBetSuccess, setShowBetSuccess] = useState(false);
  const lastRoundRef = useRef(null);

  const isBetPlaced = Boolean(myBet);
  const bettingOpen = phase === 'betting' && displayTimer > 0;

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
      setTimerLeft(data.timerLeft ?? 0);
      setBetClosesAt(data.closesAt || null);
      setBetWindowSeconds(data.betWindowSeconds ?? 15);
      setRoundId(data.roundId);
      setCrashPoint(data.crashPoint);
      setFlyingStartedAt(data.flyingStartedAt);
      setCanCashout(Boolean(data.canCashout));
      setRecentWinners(data.recentWinners || []);
      setTopWinners(data.topWinners || []);
      setRoundBets(data.roundBets || []);
      setHistory((data.history || []).map((h, i) => ({ id: h.id || i, multiplier: h.multiplier })));
      setMyBet(data.myBet);

      if (data.phase === 'flying' && data.flyingStartedAt) {
        setMultiplier(calcMult(data.flyingStartedAt));
      } else if (data.phase === 'crashed') {
        setMultiplier(data.crashPoint ?? data.multiplier ?? 1);
      } else {
        setMultiplier(1);
      }

      if (data.myBet?.status === 'cashed_out') {
        setHasCashedOut(true);
        setCashoutMult(Number(data.myBet.cashoutMultiplier));
        setCashoutPayout(Number(data.myBet.payout));
      }

      if (data.phase === 'betting' && data.roundId !== lastRoundRef.current) {
        lastRoundRef.current = data.roundId;
        setHasCashedOut(false);
        setCashoutMult(null);
        setCashoutPayout(null);
        if (data.myBet?.status !== 'active') setMyBet(null);
      }
    } catch (e) {
      if (e?.message?.includes('Too many requests')) {
        setError('Connection busy — retrying…');
      }
    }
  }, []);

  useEffect(() => {
    pollState();
    const t = setInterval(pollState, 1000);
    return () => clearInterval(t);
  }, [pollState]);

  useEffect(() => {
    if (phase !== 'betting') {
      setDisplayTimer(0);
      return undefined;
    }

    const tick = () => {
      if (betClosesAt) {
        const left = Math.max(0, Math.ceil((new Date(betClosesAt).getTime() - Date.now()) / 1000));
        setDisplayTimer(left);
        return;
      }
      setDisplayTimer(timerLeft);
    };

    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [phase, betClosesAt, timerLeft, roundId]);

  useEffect(() => {
    if (phase !== 'flying' || !flyingStartedAt) return undefined;
    let frame;
    const tick = () => {
      let m = calcMult(flyingStartedAt);
      if (crashPoint && m >= crashPoint) m = crashPoint;
      setMultiplier(m);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase, flyingStartedAt, crashPoint]);

  const handlePlaceBet = useCallback(async (amount) => {
    if (!isAuthenticated) {
      navigateTo('/login');
      return;
    }
    if (!bettingOpen || isBetPlaced || amount < 10) return;

    setError('');
    setLoading(true);
    try {
      const data = await placeAviatorBet(amount);
      setBalance(data.balance);
      setMyBet({ amount, status: 'active' });
      setShowBetSuccess(true);
      setTimeout(() => setShowBetSuccess(false), 2000);
      await pollState();
    } catch (e) {
      setError(e.message || 'Bet failed');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, bettingOpen, isBetPlaced, setBalance, pollState]);

  const handleCashout = useCallback(async () => {
    if (!canCashout || !roundId || loading) return;

    setLoading(true);
    setError('');
    try {
      const data = await cashoutAviator(roundId);
      setHasCashedOut(true);
      setCashoutMult(data.multiplier);
      setCashoutPayout(data.payout);
      setBalance(data.balance);
      await refreshBalance();
      await pollState();
    } catch (e) {
      setError(e.message || 'Cashout failed');
    } finally {
      setLoading(false);
    }
  }, [canCashout, roundId, loading, setBalance, refreshBalance, pollState]);

  return (
    <GameLayout title="AVIATOR" isWide hideBetPanel hideHeader>
      <div className="flex flex-col h-full bg-black w-full overflow-hidden">
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
              Live room · {betWindowSeconds}s rounds
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
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-black text-base tabular-nums">{balance.toFixed(2)}</span>
              <span className="text-gray-500 text-[10px] font-bold uppercase">INR</span>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-center text-sm text-red-400 bg-red-500/10 py-2 shrink-0">{error}</p>
        )}

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          <div className="hidden lg:flex lg:w-[380px] xl:w-[420px] shrink-0 h-full overflow-hidden border-r border-white/5">
            <AviatorSidebar
              allBets={roundBets}
              myBets={myBetsList}
              topBets={topWinners}
            />
          </div>

          <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto custom-scrollbar bg-[#000000]">
            <div className="lg:hidden shrink-0 h-[220px] border-b border-white/5">
              <AviatorSidebar
                allBets={roundBets}
                myBets={myBetsList}
                topBets={topWinners}
              />
            </div>

            <AviatorHistory history={history} />

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
                      : 'Next round soon…'
                }
              />
            </div>

            <div className="w-full shrink-0 p-2 bg-[#0a0a0a] border-t border-white/5">
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
              />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showBetSuccess && (
          <Motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-[#28a745] px-10 py-5 rounded-2xl font-black text-white uppercase tracking-widest border border-green-400">
              Bet locked · plane launches soon
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hasCashedOut && cashoutPayout != null && (
          <Motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: -20 }}
            className="fixed inset-0 pointer-events-none flex items-center justify-center z-[70]"
          >
            <div className="bg-[#28a745] px-10 py-5 rounded-2xl border-2 border-green-400 text-center">
              <div className="text-white text-xs font-black uppercase tracking-widest mb-1">Cashed out at</div>
              <div className="text-4xl font-black text-white italic">{(cashoutMult || multiplier).toFixed(2)}x</div>
              <div className="text-white font-black text-2xl">{formatINR(cashoutPayout)}</div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </GameLayout>
  );
};

export default Aviator;
