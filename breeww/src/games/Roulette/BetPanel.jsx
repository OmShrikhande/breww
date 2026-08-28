import React from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { formatINR } from '../../utils/formatCurrency';

const BetPanel = React.memo(({ bets, totalBet, balance }) => {
  return (
    <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-3 text-white backdrop-blur-xl sm:rounded-[26px] sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d8bb82]/75">Active Bets</div>
          <h3 className="mt-1 text-lg font-black">Bet Slip</h3>
        </div>
        <div className="rounded-full border border-[#ffd54f]/25 bg-[#ffd54f]/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#ffe49a]">
          {bets.length} placed
        </div>
      </div>

      <div className="mt-4 max-h-[320px] space-y-2 overflow-y-auto pr-1 sm:max-h-none sm:overflow-visible sm:pr-0">
        <AnimatePresence initial={false}>
          {bets.length > 0 ? (
            bets.map((bet) => (
              <Motion.div
                key={bet.key}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-3 py-2"
              >
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.16em] text-white/75">{bet.label}</div>
                  <div className="mt-1 text-[11px] font-semibold text-white/45">{bet.type}</div>
                </div>
                <div className="text-sm font-black text-[#ffe49a]">{formatINR(bet.amount)}</div>
              </Motion.div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-6 text-center text-sm font-semibold text-white/45">
              Select a chip and tap table cells to build your bet slip.
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-3">
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45">Total Bet</div>
          <div className="mt-1 text-xl font-black text-white">{formatINR(totalBet)}</div>
        </div>
        <div className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-3">
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45">Wallet Balance</div>
          <div className="mt-1 text-xl font-black text-white">{formatINR(balance)}</div>
        </div>
      </div>
    </div>
  );
});

BetPanel.displayName = 'BetPanel';

export default BetPanel;
