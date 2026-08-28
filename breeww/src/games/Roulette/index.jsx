import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { AlertCircle, BarChart3, CheckCircle2, LoaderCircle, Volume2, VolumeX } from 'lucide-react';
import GameLayout from '../GameLayout';
import { submitRouletteBet } from '../../api/gameApi';
import { useWallet } from '../../hooks/useWallet';
import { formatINR } from '../../utils/formatCurrency';
import RouletteBoard from './RouletteBoard';
import ChipSelector from './ChipSelector';
import BetPanel from './BetPanel';
import RouletteControls from './RouletteControls';
import BetHistory from './BetHistory';

const chipValues = [10, 50, 100, 500];
const chipStackOrder = [500, 100, 50, 10];

const createTimestampLabel = (date = new Date()) =>
  date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

const normalizeResult = (payload) => {
  const winningNumberValue =
    payload?.winningNumber ??
    payload?.result?.winningNumber ??
    payload?.result?.number ??
    payload?.winning?.number ??
    null;

  const payout =
    payload?.payout ??
    payload?.result?.payout ??
    payload?.settlement?.payout ??
    null;

  return {
    id: payload?.roundId ?? payload?.id ?? `result-${Date.now()}`,
    winningNumber:
      winningNumberValue == null || winningNumberValue === ''
        ? null
        : typeof winningNumberValue === 'number'
          ? winningNumberValue
          : Number(winningNumberValue),
    payout: typeof payout === 'number' ? payout : payout != null ? Number(payout) : null,
    raw: payload,
  };
};

const buildChipStack = (amount) => {
  const chips = [];
  let remaining = amount;

  chipStackOrder.forEach((value) => {
    while (remaining >= value && chips.length < 5) {
      chips.push(value);
      remaining -= value;
    }
  });

  if (chips.length === 0 && amount > 0) {
    chips.push(chipValues[0]);
  }

  return chips;
};

const submitRouletteBets = async ({ bets, signal }) => submitRouletteBet(bets, { signal });

const Roulette = () => {
  const { balance, refreshBalance, setBalance } = useWallet();
  const [selectedChip, setSelectedChip] = useState(chipValues[0]);
  const [bets, setBets] = useState([]);
  const [history, setHistory] = useState([]);
  const [winningNumber, setWinningNumber] = useState(null);
  const [requestState, setRequestState] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('Place chips on the table. The backend will decide the winning result.');
  const [errorMessage, setErrorMessage] = useState('');
  const [placementHistory, setPlacementHistory] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const totalBet = useMemo(
    () => bets.reduce((sum, bet) => sum + bet.amount, 0),
    [bets]
  );

  const betAmountsByKey = useMemo(
    () =>
      bets.reduce((accumulator, bet) => {
        accumulator[bet.key] = bet.amount;
        return accumulator;
      }, {}),
    [bets]
  );

  const betStacksByKey = useMemo(
    () =>
      bets.reduce((accumulator, bet) => {
        accumulator[bet.key] = buildChipStack(bet.amount);
        return accumulator;
      }, {}),
    [bets]
  );

  const canSpin = bets.length > 0 && totalBet > 0 && totalBet <= balance;
  const canUndo = placementHistory.length > 0;
  const canClear = bets.length > 0;
  const canDouble = bets.length > 0 && totalBet * 2 <= balance;
  const isSpinning = requestState === 'submitting';

  const placeBet = useCallback(
    (betDescriptor) => {
      if (isSpinning) return;

      setRequestState('idle');
      setWinningNumber(null);
      setErrorMessage('');
      setStatusMessage(`Added ${formatINR(selectedChip)} on ${betDescriptor.label}.`);
      setPlacementHistory((current) => [...current, { key: betDescriptor.key, amount: selectedChip }]);

      setBets((currentBets) => {
        const existingBet = currentBets.find((bet) => bet.key === betDescriptor.key);
        if (existingBet) {
          return currentBets.map((bet) =>
            bet.key === betDescriptor.key
              ? { ...bet, amount: bet.amount + selectedChip }
              : bet
          );
        }

        return [...currentBets, { ...betDescriptor, amount: selectedChip }];
      });
    },
    [isSpinning, selectedChip]
  );

  const handleControlAction = useCallback(
    (actionId) => {
      setErrorMessage('');

      if (actionId === 'clear') {
        setRequestState('idle');
        setBets([]);
        setPlacementHistory([]);
        setWinningNumber(null);
        setStatusMessage('All chips cleared from the table.');
        return;
      }

      if (actionId === 'undo') {
        if (placementHistory.length === 0) {
          setStatusMessage('No chips to undo.');
          return;
        }

        setRequestState('idle');
        const lastPlacement = placementHistory[placementHistory.length - 1];
        setPlacementHistory((currentHistory) => currentHistory.slice(0, -1));
        setBets((currentBets) =>
          currentBets
            .map((bet) =>
              bet.key === lastPlacement.key
                ? { ...bet, amount: bet.amount - lastPlacement.amount }
                : bet
            )
            .filter((bet) => bet.amount > 0)
        );
        setStatusMessage('Last chip removed from the table.');
        return;
      }

      if (actionId === 'double') {
        setRequestState('idle');
        setBets((currentBets) => currentBets.map((bet) => ({ ...bet, amount: bet.amount * 2 })));
        setPlacementHistory((currentHistory) => [
          ...currentHistory,
          ...currentHistory.map((entry) => ({ ...entry })),
        ]);
        setStatusMessage('All active bets doubled.');
        return;
      }

      setStatusMessage(`${actionId.toUpperCase()} will be enabled once the backend exposes that API.`);
    },
    [placementHistory]
  );

  const handleSpin = useCallback(async () => {
    if (!canSpin || isSpinning) {
      if (totalBet > balance) {
        setErrorMessage('Total bet exceeds wallet balance.');
      }
      return;
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setRequestState('submitting');
    setErrorMessage('');
    setStatusMessage('Submitting bets to the roulette backend...');

    const payloadBets = bets.map((bet) => ({
      type: bet.type,
      value: bet.value,
      amount: bet.amount,
    }));

    try {
      const response = await submitRouletteBets({
        bets: payloadBets,
        signal: abortControllerRef.current.signal,
      });
      const result = normalizeResult(response);

      setWinningNumber(Number.isNaN(result.winningNumber) ? null : result.winningNumber);
      setHistory((current) => [
        {
          id: result.id,
          winningNumber: Number.isNaN(result.winningNumber) ? null : result.winningNumber,
          payout: result.payout,
          totalBet,
          timestampLabel: createTimestampLabel(),
        },
        ...current,
      ].slice(0, 8));
      setBets([]);
      setPlacementHistory([]);
      setRequestState('success');
      if (response?.balance != null) {
        setBalance(Number(response.balance));
      } else {
        await refreshBalance();
      }
      setStatusMessage(
        Number.isNaN(result.winningNumber)
          ? 'Backend accepted the round result.'
          : `Winning number ${result.winningNumber} received from backend.`
      );
    } catch (error) {
      if (error.name === 'AbortError') return;

      setRequestState('error');
      setErrorMessage(error.message || 'Failed to submit bets.');
      setStatusMessage('Unable to complete the spin request.');
    }
  }, [balance, bets, canSpin, isSpinning, totalBet, refreshBalance, setBalance]);

  const statusTone =
    requestState === 'error'
      ? 'error'
      : requestState === 'success'
        ? 'success'
        : 'neutral';

  return (
    <GameLayout title="ROULETTE" isWide hideBetPanel hideHeader>
      <div className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(198,40,40,0.18),transparent_24%),radial-gradient(circle_at_bottom,_rgba(46,125,50,0.18),transparent_30%),linear-gradient(180deg,#050505_0%,#0d0d0f_32%,#1a0d0d_100%)] px-2 py-3 text-white sm:px-4 sm:py-4 lg:px-6">
        <div className="mx-auto max-w-[1440px]">
          <div className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(9,9,10,0.98),rgba(13,13,15,0.96))] p-2 shadow-[0_32px_120px_rgba(0,0,0,0.45)] sm:rounded-[34px] sm:p-4 lg:p-5">
            <div className="overflow-hidden rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,#0a0a0b_0%,#050505_100%)]">
              <div className="flex items-center justify-between gap-2 border-b border-white/8 bg-[linear-gradient(180deg,#151515_0%,#0f0f10_100%)] px-3 py-2.5 sm:px-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white shadow-[0_0_24px_rgba(255,255,255,0.06)]"
                  >
                    <BarChart3 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSoundEnabled((current) => !current)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white shadow-[0_0_24px_rgba(255,255,255,0.06)]"
                  >
                    {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>
                </div>
                <div className="text-center">
                  <div className="text-sm font-black uppercase tracking-[0.22em] text-white">Place Your Bets</div>
                </div>
                <div className="rounded-full border border-[#d8bb82]/40 bg-[#d8bb82]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#ffe49a]">
                  Lobby
                </div>
              </div>

              <div className="hidden border-b border-white/8 px-4 py-3 lg:block">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.34em] text-[#d8bb82]/75">Live Table Client</div>
                    <h1 className="mt-1 bg-gradient-to-r from-white via-[#ffe7ac] to-[#d8bb82] bg-clip-text text-4xl font-black text-transparent">
                      Roulette
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm font-semibold text-white/58">
                      Production-grade frontend table for backend-controlled roulette rounds. Bets, totals, and submission stay in the client. Winning outcomes come only from API responses.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#d8bb82]/75">Total Bet</div>
                      <div className="mt-2 text-xl font-black">{formatINR(totalBet)}</div>
                    </div>
                    <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#d8bb82]/75">Wallet Balance</div>
                      <div className="mt-2 text-xl font-black">{formatINR(balance)}</div>
                    </div>
                    <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#d8bb82]/75">API Endpoint</div>
                      <div className="mt-2 truncate text-sm font-black text-white/82">{rouletteEndpoint}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`mt-3 flex items-center gap-2 rounded-[18px] border px-3 py-2.5 text-xs font-semibold sm:mt-4 sm:rounded-[22px] sm:px-4 sm:py-3 sm:text-sm ${
                statusTone === 'error'
                  ? 'border-rose-300/20 bg-rose-400/10 text-rose-100'
                  : statusTone === 'success'
                    ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-100'
                    : 'border-[#ffd54f]/20 bg-[#ffd54f]/10 text-[#ffe49a]'
              }`}
            >
              {statusTone === 'error' ? (
                <AlertCircle size={16} />
              ) : statusTone === 'success' ? (
                <CheckCircle2 size={16} />
              ) : (
                <Volume2 size={16} />
              )}
              <span>{errorMessage || statusMessage}</span>
              {isSpinning && <LoaderCircle size={16} className="ml-auto animate-spin" />}
            </div>

            <div className="mt-3 space-y-4 sm:mt-5">
              <Motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="grid gap-3 lg:gap-4"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_72px] gap-2 sm:grid-cols-[minmax(0,1fr)_86px] sm:gap-3 lg:grid-cols-[minmax(0,1fr)_108px] lg:gap-4">
                  <RouletteBoard
                    betStacksByKey={betStacksByKey}
                    betAmountsByKey={betAmountsByKey}
                    selectedChip={selectedChip}
                    onPlaceBet={placeBet}
                    winningNumber={winningNumber}
                    isSpinning={isSpinning}
                    totalBet={totalBet}
                    balance={balance}
                  />

                  <RouletteControls
                    onAction={handleControlAction}
                    onSpin={handleSpin}
                    isSpinning={isSpinning}
                    canSpin={canSpin}
                    canUndo={canUndo}
                    canClear={canClear}
                    canDouble={canDouble}
                  />
                </div>

                <ChipSelector chipValues={chipValues} selectedChip={selectedChip} onSelectChip={setSelectedChip} />
              </Motion.div>

              <Motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
                className="hidden gap-4 xl:grid-cols-[minmax(0,1fr)_360px] lg:grid"
              >
                <BetPanel bets={bets} totalBet={totalBet} balance={balance} />
                <BetHistory entries={history} />
              </Motion.div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {winningNumber != null && (
            <Motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="pointer-events-none fixed bottom-6 left-1/2 z-[80] w-[min(92vw,420px)] -translate-x-1/2 rounded-[28px] border border-[#ffd54f]/30 bg-[linear-gradient(180deg,rgba(46,125,50,0.98),rgba(27,94,32,0.94))] px-6 py-4 text-center text-white shadow-[0_20px_60px_rgba(46,125,50,0.28)]"
            >
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-50/80">Result Received</div>
              <div className="mt-2 text-3xl font-black">{winningNumber}</div>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameLayout>
  );
};

export default Roulette;
