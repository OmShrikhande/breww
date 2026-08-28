import React from 'react';
import { motion as Motion } from 'framer-motion';

const RiskProgress = ({ round, progressPercent }) => {
  return (
    <div className="rounded-[24px] border border-[#c8a86a]/12 bg-[linear-gradient(180deg,rgba(28,28,29,0.95),rgba(13,13,13,0.95))] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c8a86a]/70">Risk Progress</div>
          <div className="mt-1 text-sm font-semibold text-white/70">Suspense rises every safe reveal.</div>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-white/75">
          {progressPercent}%
        </div>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
        <Motion.div
          className="relative h-full rounded-full bg-[linear-gradient(90deg,#4a8b34_0%,#c8a86a_45%,#f59e0b_70%,#b11d34_100%)]"
          initial={false}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <Motion.div
            animate={{ x: ['-100%', '180%'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-y-0 left-0 w-16 skew-x-[-22deg] bg-white/30 blur-sm"
          />
        </Motion.div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
        <span>Round {round}</span>
        <span>High risk zone at 70%+</span>
      </div>
    </div>
  );
};

export default RiskProgress;
