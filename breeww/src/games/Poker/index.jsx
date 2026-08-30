import React, { useMemo, useState } from 'react';
import { ChevronLeft, Menu, Sparkles, Users } from 'lucide-react';
import GameLayout from '../GameLayout';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../hooks/useWallet';
import { formatINR } from '../../utils/formatCurrency';
import PokerTable from './PokerTable';
import PokerControls from './PokerControls';
import PokerHistory from './PokerHistory';
import ChipStack from './ChipStack';
import { navigateTo } from '../../lib/navigation';

const seatPositions = [
  'bottom-4 left-1/2 z-20 -translate-x-1/2 sm:bottom-8',
  'bottom-[23%] left-0 z-10 sm:left-4',
  'top-[19%] left-[6%] z-10 sm:top-[16%] sm:left-[10%]',
  'top-4 left-1/2 z-10 -translate-x-1/2 sm:top-8',
  'top-[19%] right-[6%] z-10 sm:top-[16%] sm:right-[10%]',
  'bottom-[23%] right-0 z-10 sm:right-4',
];

const initialPlayers = [
  {
    id: 1,
    username: 'You',
    avatar: 'RK',
    avatarGradient: 'from-sky-400 to-indigo-600',
    stack: 4850,
    bet: 300,
    status: 'Your Turn',
    cards: [
      { rank: 'A', suit: 'spades' },
      { rank: 'K', suit: 'hearts' },
    ],
    isUser: true,
    isActive: true,
    isDealer: false,
    isWinner: false,
  },
  {
    id: 2,
    username: 'Maya77',
    avatar: 'MY',
    avatarGradient: 'from-rose-400 to-red-700',
    stack: 3620,
    bet: 300,
    status: 'Call',
    cards: [
      { rank: 'Q', suit: 'clubs' },
      { rank: 'Q', suit: 'spades' },
    ],
    isDealer: false,
    isWinner: false,
  },
  {
    id: 3,
    username: 'BluffPro',
    avatar: 'BP',
    avatarGradient: 'from-violet-400 to-fuchsia-700',
    stack: 5120,
    bet: 600,
    status: 'Raise',
    cards: [
      { rank: '10', suit: 'diamonds' },
      { rank: 'J', suit: 'diamonds' },
    ],
    isDealer: false,
    isWinner: false,
  },
  {
    id: 4,
    username: 'DealerBot',
    avatar: 'DB',
    avatarGradient: 'from-amber-300 to-orange-700',
    stack: 7040,
    bet: 0,
    status: 'Waiting',
    cards: [
      { rank: '7', suit: 'clubs' },
      { rank: '7', suit: 'hearts' },
    ],
    isDealer: true,
    isWinner: false,
  },
  {
    id: 5,
    username: 'RiverRun',
    avatar: 'RR',
    avatarGradient: 'from-emerald-400 to-teal-700',
    stack: 2810,
    bet: 300,
    status: 'Check',
    cards: [
      { rank: '9', suit: 'spades' },
      { rank: '9', suit: 'clubs' },
    ],
    isDealer: false,
    isWinner: false,
  },
  {
    id: 6,
    username: 'AceLoom',
    avatar: 'AL',
    avatarGradient: 'from-cyan-400 to-blue-700',
    stack: 4380,
    bet: 0,
    status: 'Fold',
    cards: [
      { rank: '2', suit: 'hearts' },
      { rank: '8', suit: 'spades' },
    ],
    isDealer: false,
    isWinner: false,
  },
];

const initialCommunityCards = [
  { rank: 'A', suit: 'hearts' },
  { rank: 'Q', suit: 'diamonds' },
  { rank: '10', suit: 'clubs' },
  { rank: '5', suit: 'spades' },
  { rank: '2', suit: 'clubs' },
];

const historyBase = [
  { id: 'h1', player: 'BluffPro', action: 'Raise', detail: 'Pressure on the flop', amount: 600, time: '2 sec ago', accentClass: 'bg-amber-300/12 text-amber-200' },
  { id: 'h2', player: 'Maya77', action: 'Call', detail: 'Matched the table lead', amount: 300, time: '8 sec ago', accentClass: 'bg-sky-400/12 text-sky-200' },
  { id: 'h3', player: 'AceLoom', action: 'Fold', detail: 'Stepped away before turn', amount: null, time: '16 sec ago', accentClass: 'bg-rose-400/12 text-rose-200' },
  { id: 'h4', player: 'RiverRun', action: 'Check', detail: 'Slow play from the right wing', amount: null, time: '22 sec ago', accentClass: 'bg-white/10 text-white/80' },
];

const chipOptions = [100, 250, 500, 1000, 2000];

const actionMap = {
  check: { label: 'Check', accentClass: 'bg-white/10 text-white/80', detail: 'Checked and kept the action alive' },
  call: { label: 'Call', accentClass: 'bg-sky-400/12 text-sky-200', detail: 'Called the current table bet' },
  raise: { label: 'Raise', accentClass: 'bg-amber-300/12 text-amber-200', detail: 'Raised the pace of the round' },
  fold: { label: 'Fold', accentClass: 'bg-rose-400/12 text-rose-200', detail: 'Folded this hand' },
  'all-in': { label: 'All-in', accentClass: 'bg-emerald-400/12 text-emerald-200', detail: 'Pushed the entire stack in' },
};

const Poker = () => {
  const { isAuthenticated } = useAuth();
  const { balance } = useWallet();
  const [betAmount, setBetAmount] = useState(500);
  const [pot, setPot] = useState(1200);
  const [selectedAction, setSelectedAction] = useState('raise');
  const [players, setPlayers] = useState(() =>
    initialPlayers.map((player, index) => ({
      ...player,
      positionClass: seatPositions[index],
    }))
  );
  const [history, setHistory] = useState(historyBase);

  const tableStats = useMemo(
    () => [
      { label: 'Players', value: '6 / 6' },
      { label: 'Blinds', value: '₹100 / ₹200' },
      { label: 'Avg Stack', value: formatINR(4637) },
    ],
    []
  );

  const maxBet = Math.min(5000, Math.max(1500, balance));

  const handleBetAmountChange = (nextAmount) => {
    setBetAmount(Math.min(maxBet, Math.max(100, nextAmount)));
  };

  const handleAction = (actionId) => {
    if (!isAuthenticated) {
      navigateTo('/login');
      return;
    }
    const actionMeta = actionMap[actionId];
    const actionAmount = actionId === 'check' || actionId === 'fold' ? null : actionId === 'all-in' ? players[0].stack : betAmount;

    setSelectedAction(actionId);
    setPot((currentPot) => currentPot + (actionAmount || 0));
    setPlayers((currentPlayers) =>
      currentPlayers.map((player, index) => {
        if (index === 0) {
          const nextStack = actionAmount ? Math.max(0, player.stack - actionAmount) : player.stack;
          return {
            ...player,
            stack: nextStack,
            bet: actionAmount || 0,
            status: actionMeta.label,
            isActive: false,
            isWinner: false,
          };
        }

        if (index === 1) {
          return {
            ...player,
            status: 'Thinking',
            isActive: true,
            isWinner: false,
          };
        }

        return {
          ...player,
          isActive: false,
          isWinner: false,
        };
      })
    );
    setHistory((currentHistory) => [
      {
        id: `history-${Date.now()}`,
        player: 'You',
        action: actionMeta.label,
        detail: actionMeta.detail,
        amount: actionAmount,
        time: 'just now',
        accentClass: actionMeta.accentClass,
      },
      ...currentHistory,
    ].slice(0, 6));
  };

  return (
    <GameLayout title="POKER" isWide hideHeader hideBetPanel>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),transparent_24%),linear-gradient(180deg,#09121d_0%,#07141f_32%,#03130f_100%)] text-white">
        <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-3 py-3 sm:px-4 lg:px-6">
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,19,31,0.92),rgba(4,11,19,0.88))] p-3 shadow-[0_18px_60px_rgba(0,0,0,0.35)] sm:p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigateTo('/')}
                    className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-white transition-colors hover:bg-white/10"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.38em] text-emerald-100/60">Texas Hold'em</div>
                    <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">Poker Royale Table</h1>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-white transition-colors hover:bg-white/10 xl:hidden"
                >
                  <Menu size={20} />
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 xl:flex xl:items-center">
                <div className="rounded-2xl border border-amber-300/10 bg-amber-300/10 px-4 py-3">
                  <div className="flex items-center gap-2 text-amber-100">
                    <Sparkles size={15} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Live Preview</span>
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white/80">Real-time updates and interactive features</div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="rounded-full border border-white/10 bg-white/5 p-2 text-emerald-100">
                    <Users size={16} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-100/60">Wallet</div>
                    <div className="text-base font-black">{formatINR(balance)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {tableStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-100/55">{stat.label}</div>
                  <div className="mt-1 text-sm font-bold text-white">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              <PokerTable players={players} communityCards={initialCommunityCards} pot={pot} />

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
                <PokerControls
                  betAmount={betAmount}
                  minBet={100}
                  maxBet={maxBet}
                  chipOptions={chipOptions}
                  onBetAmountChange={handleBetAmountChange}
                  onAction={handleAction}
                  selectedAction={selectedAction}
                />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <ChipStack amount={pot} label="Total Pot" compact />
                  <ChipStack amount={betAmount} label="Selected Bet" compact />
                </div>
              </div>
            </div>

            <div className="pb-4 xl:pb-0">
              <PokerHistory entries={history} />
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  );
};

export default Poker;
