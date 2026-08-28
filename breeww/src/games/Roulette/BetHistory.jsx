import React from 'react';
import { motion as Motion } from 'framer-motion';
import { formatINR } from '../../utils/formatCurrency';

const BetHistory = React.memo(({ entries }) => {
  return (
    <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 text-white backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d8bb82]/75">Recent Results</div>
          <h3 className="mt-1 text-lg font-black">Bet History</h3>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/60">
          API driven
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <Motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-3 py-3"
            >
              <div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-white/80">
                  Winning No. {entry.winningNumber ?? '--'}
                </div>
                <div className="mt-1 text-[11px] font-semibold text-white/45">
                  {entry.timestampLabel}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-[#ffe49a]">{formatINR(entry.totalBet)}</div>
                <div className="mt-1 text-[11px] font-semibold text-emerald-300/80">
                  {entry.payout != null ? `Payout ${formatINR(entry.payout)}` : 'Awaiting payout'}
                </div>
              </div>
            </Motion.div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-6 text-center text-sm font-semibold text-white/45">
            Spin results from the backend will appear here.
          </div>
        )}
      </div>
    </div>
  );
});

BetHistory.displayName = 'BetHistory';

export default BetHistory;
