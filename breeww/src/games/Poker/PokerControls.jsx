import React from 'react';
import { Coins, Flame, ShieldCheck } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';

const actionButtons = [
  { id: 'check', label: 'Check', className: 'border-white/10 bg-white/5 hover:bg-white/10' },
  { id: 'call', label: 'Call', className: 'border-sky-300/20 bg-sky-400/10 hover:bg-sky-400/20' },
  { id: 'raise', label: 'Raise', className: 'border-amber-300/25 bg-amber-300/10 hover:bg-amber-300/20' },
  { id: 'fold', label: 'Fold', className: 'border-rose-300/20 bg-rose-400/10 hover:bg-rose-400/20' },
  { id: 'all-in', label: 'All-in', className: 'border-emerald-300/20 bg-emerald-400/10 hover:bg-emerald-400/20' },
];

const PokerControls = ({
  betAmount,
  minBet,
  maxBet,
  chipOptions,
  onBetAmountChange,
  onAction,
  selectedAction,
}) => {
  return (
    <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,21,37,0.96),rgba(6,10,18,0.98))] p-4 text-white shadow-[0_24px_70px_rgba(0,0,0,0.34)] sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-amber-300/15 bg-amber-300/10 p-2 text-amber-200">
              <Coins size={16} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.36em] text-emerald-100/60">Betting Rail</div>
              <h3 className="mt-1 text-lg font-black">Adjust your stake</h3>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.24em] text-white/55">Raise Amount</span>
              <span className="text-xl font-black text-amber-200">{formatINR(betAmount)}</span>
            </div>
            <input
              type="range"
              min={minBet}
              max={maxBet}
              step={50}
              value={betAmount}
              onChange={(event) => onBetAmountChange(Number(event.target.value))}
              className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-amber-300"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-white/45">
              <span>{formatINR(minBet)}</span>
              <span>{formatINR(maxBet)}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {chipOptions.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => onBetAmountChange(chip)}
                  className={`rounded-full border px-3 py-2 text-sm font-black transition-all ${betAmount === chip ? 'border-amber-300/60 bg-amber-300 text-slate-950 shadow-[0_8px_24px_rgba(251,191,36,0.28)]' : 'border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10'}`}
                >
                  + {formatINR(chip)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:w-[380px]">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {actionButtons.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => onAction(action.id)}
                className={`rounded-2xl border px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition-all ${action.className} ${selectedAction === action.id ? 'scale-[1.02] ring-2 ring-amber-300/40' : ''}`}
              >
                {action.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2 text-emerald-200">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.28em]">Round State</span>
              </div>
              <div className="mt-2 text-sm font-semibold text-white/75">
                Frontend preview only. Button taps update the table feed and seat state, ready for backend hooks later.
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2 text-amber-200">
                <Flame size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.28em]">Hot Tip</span>
              </div>
              <div className="mt-2 text-sm font-semibold text-white/75">
                Use quick chips for touch devices and the slider for precise raises on larger screens.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokerControls;
