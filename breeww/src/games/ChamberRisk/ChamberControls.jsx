import React from 'react';
import { motion as Motion } from 'framer-motion';
import { Gauge, HandCoins, IndianRupee, Radar, RotateCcw, Wallet } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';

const quickBets = [10, 50, 100, 500];

const actionButtonBase =
  'min-h-12 rounded-2xl border px-4 py-3 text-sm font-black uppercase tracking-[0.16em] transition-all focus:outline-none focus:ring-2 focus:ring-sky-300/70 focus:ring-offset-2 focus:ring-offset-[#0B0F2A]';

const ChamberControls = ({
  betAmount,
  onBetAmountChange,
  onQuickBet,
  onStartGame,
  onNextRound,
  onCashout,
  selectedChamber,
  statusTone,
  canStart,
  canPlayRound,
  canCashout,
  gameState,
  round,
  multiplier,
  actionLabel,
}) => {
  const panelToneClass =
    statusTone === 'danger'
      ? 'border-rose-300/20 bg-rose-400/10 text-rose-100'
      : statusTone === 'success'
        ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-100'
        : 'border-[#d5b06b]/20 bg-[#d5b06b]/10 text-[#f3d79a]';
  const sliderMax = 5000;
  const sliderPercent = Math.min(100, Math.max(0, (Math.max(10, betAmount) / sliderMax) * 100));
  const commandCenter = [
    { label: 'Round', value: round, icon: Radar },
    { label: 'Current', value: `${multiplier.toFixed(2)}x`, icon: Gauge },
    { label: 'Action', value: actionLabel, icon: Wallet },
  ];

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-[#c8a86a]/15 bg-[linear-gradient(180deg,#121212_0%,#060606_100%)] p-4 text-white shadow-[0_18px_70px_rgba(0,0,0,0.32)] sm:p-5">
      <div className="absolute inset-x-0 bottom-0 h-24 bg-[radial-gradient(circle_at_bottom,_rgba(249,115,22,0.14),transparent_70%)]" />

      <div className="relative">
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c8a86a]/70">Controls</div>
        <h3 className="mt-1 text-xl font-black">Betting Console</h3>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {commandCenter.map((item) => (
            <div key={item.label} className="rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(42,42,44,0.95),rgba(21,21,21,0.95))] px-3 py-3">
              <div className="flex items-center gap-2 text-[#f3d79a]">
                <item.icon size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c8a86a]/70">{item.label}</span>
              </div>
              <div className="mt-2 text-sm font-black text-white">{item.value}</div>
            </div>
          ))}
        </div>

        <Motion.div
          animate={{ boxShadow: gameState === 'resolving' ? '0 0 24px rgba(213,176,107,0.18)' : '0 0 0 rgba(0,0,0,0)' }}
          className={`mt-4 rounded-[22px] border px-4 py-3 text-sm font-semibold ${panelToneClass} bg-opacity-80`}
        >
          Selected chamber: <span className="font-black">#{selectedChamber}</span>
        </Motion.div>

        <div className="mt-4">
          <label htmlFor="chamber-bet" className="text-xs font-black uppercase tracking-[0.22em] text-white/65">
            Bet Amount
          </label>
          <Motion.div
            animate={{
              scale: [1, 1.01, 1],
              borderColor: ['rgba(255,255,255,0.08)', 'rgba(213,176,107,0.3)', 'rgba(255,255,255,0.08)'],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="mt-2 rounded-[24px] border border-white/10 bg-black/30 p-2"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4">
              <IndianRupee size={18} className="text-[#f3d79a]" />
              <input
                id="chamber-bet"
                type="number"
                min="1"
                step="10"
                value={betAmount}
                onChange={(event) => onBetAmountChange(Number(event.target.value) || 0)}
                className="h-12 w-full bg-transparent text-lg font-black text-white outline-none placeholder:text-white/25"
                placeholder="Enter stake"
              />
            </div>
          </Motion.div>
          <div className="relative mt-4">
            <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-white/10" />
            <Motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#c8a86a_0%,#f59e0b_52%,#f97316_100%)] shadow-[0_0_24px_rgba(245,158,11,0.35)]"
              animate={{ width: `${sliderPercent}%` }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />
            <input
              type="range"
              min="10"
              max={sliderMax}
              step="10"
              value={Math.max(10, Math.min(sliderMax, betAmount))}
              onChange={(event) => onBetAmountChange(Number(event.target.value))}
              className="relative h-2 w-full cursor-pointer appearance-none rounded-full bg-transparent accent-sky-400"
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
            <span>Min 10</span>
            <span>Max {formatINR(sliderMax)}</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-white/65">Quick Bets</div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {quickBets.map((amount) => (
              <Motion.button
                key={amount}
                type="button"
                onClick={() => onQuickBet(amount)}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`rounded-full border px-3 py-3 text-sm font-black transition-all focus:outline-none focus:ring-2 focus:ring-[#d5b06b]/70 focus:ring-offset-2 focus:ring-offset-black ${
                  betAmount === amount
                    ? 'border-[#d5b06b]/70 bg-[#d5b06b]/18 text-white shadow-[0_0_28px_rgba(213,176,107,0.24)]'
                    : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                <span className="block">{formatINR(amount)}</span>
              </Motion.button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <button
            type="button"
            onClick={onStartGame}
            disabled={!canStart}
            className={`${actionButtonBase} flex items-center justify-center gap-2 border-emerald-300/25 bg-[linear-gradient(180deg,rgba(40,107,53,0.95),rgba(26,76,37,0.92))] text-white shadow-[0_12px_30px_rgba(16,185,129,0.18)] enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-45`}
          >
            <HandCoins size={16} />
            Start Game
          </button>
          <button
            type="button"
            onClick={onNextRound}
            disabled={!canPlayRound}
            className={`${actionButtonBase} flex items-center justify-center gap-2 border-[#d5b06b]/30 bg-[linear-gradient(180deg,rgba(176,32,52,0.96),rgba(128,19,35,0.92))] text-white shadow-[0_12px_30px_rgba(176,32,52,0.24)] enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-45`}
          >
            <Radar size={16} />
            Next Round
          </button>
          <button
            type="button"
            onClick={onCashout}
            disabled={!canCashout}
            className={`${actionButtonBase} flex items-center justify-center gap-2 border-[#d5b06b]/30 bg-[linear-gradient(180deg,rgba(50,103,61,0.95),rgba(29,75,45,0.92))] text-white shadow-[0_12px_30px_rgba(34,197,94,0.18)] enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-45`}
          >
            <Wallet size={16} />
            Cashout
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: 'Racetrack', icon: Radar },
            { label: 'Undo', icon: RotateCcw },
            { label: 'Spin', icon: Gauge },
          ].map((rail) => (
            <div
              key={rail.label}
              className="flex flex-col items-center justify-center rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(31,31,32,0.96),rgba(16,16,16,0.96))] px-3 py-4 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d5b06b]/50 text-[#f3d79a]">
                <rail.icon size={18} />
              </div>
              <div className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/65">{rail.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChamberControls;
