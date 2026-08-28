import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Trophy } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';

const AviatorGraph = ({
  multiplier,
  gameState,
  roundId,
  timerLeft = 10,
  betWindowSeconds = 10,
  recentWinners = [],
  waitingMessage,
}) => {
  const width = 800;
  const height = 400;
  const paddingX = 40;
  const paddingY = 40;

  const progress = Math.min((multiplier - 1) / 12, 1);
  const startX = paddingX;
  const startY = height - paddingY;
  const endX = (width - paddingX * 2) * progress + paddingX;
  const endY = (height - paddingY * 2) * (1 - progress) + paddingY;
  const cpX = endX * 0.6 + startX * 0.4;
  const cpY = startY;
  const pathData = `M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`;
  const progressPct = Math.min(100, ((betWindowSeconds - timerLeft) / betWindowSeconds) * 100);

  return (
    <div className="relative w-full h-full bg-[#000000] overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 w-full p-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-md border border-white/5">
          <span className="text-[10px] text-gray-500 font-bold uppercase">Round</span>
          <span className="text-[10px] text-gray-300 font-bold tabular-nums">{roundId || '—'}</span>
          <ChevronDown size={12} className="text-gray-500" />
        </div>
        {gameState === 'waiting' && (
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-md border border-amber-500/30">
            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-1000"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[10px] text-amber-300 font-black tabular-nums">{timerLeft}s</span>
          </div>
        )}
      </div>

      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            backgroundPosition: `${paddingX}px ${startY}px`,
          }}
        />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.03)_0%,_transparent_70%)]" />

      <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 w-full h-full">
        {gameState === 'running' && (
          <path
            d={pathData}
            fill="none"
            stroke="#ff0000"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
          />
        )}

        <AnimatePresence>
          {gameState === 'running' && (
            <motion.g
              initial={{ x: startX, y: startY, rotate: 0, opacity: 0 }}
              animate={{ x: endX, y: endY, rotate: -5, opacity: 1 }}
              transition={{ duration: 0.08, ease: 'linear' }}
            >
              <g transform="translate(-55, -18) scale(1.8)">
                <path d="M0,10 C10,10 20,8 30,5 L50,5 L60,10 L50,15 L30,15 C20,12 10,10 0,10 Z" fill="#ff0000" />
                <path d="M25,10 L15,-10 L40,10 Z" fill="#ff0000" />
                <path d="M25,10 L15,30 L40,10 Z" fill="#ff0000" />
                <path d="M10,10 L0,0 L15,10 Z" fill="#cc0000" />
                <path d="M42,7 L52,10 L42,13 Z" fill="rgba(255,255,255,0.4)" />
              </g>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 px-4">
        <AnimatePresence mode="wait">
          {gameState === 'waiting' ? (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="text-center w-full max-w-md"
            >
              <p className="text-amber-400 font-black uppercase tracking-[0.2em] text-sm mb-4">
                {waitingMessage}
              </p>

              {recentWinners.length > 0 && (
                <div className="game-glass rounded-2xl border border-white/10 p-3 text-left max-h-[220px] overflow-y-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy size={14} className="text-amber-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                      Last round winners
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {recentWinners.slice(0, 8).map((w) => (
                      <div key={w.id} className="flex items-center justify-between text-[11px]">
                        <span className="text-white/60 font-bold">{w.user}</span>
                        <span className="text-emerald-400 font-black tabular-nums">
                          {w.cashoutMult?.toFixed(2)}x · {formatINR(w.payout || w.amount * w.cashoutMult)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : gameState === 'crashed' ? (
            <motion.div
              key="crashed"
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="text-red-600 font-black italic text-5xl md:text-7xl tracking-tighter mb-2">
                FLEW AWAY!
              </div>
              <div className="text-white font-black text-5xl md:text-7xl tabular-nums">
                {multiplier.toFixed(2)}x
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="running"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="text-white font-black text-[80px] md:text-[120px] leading-none tracking-tighter drop-shadow-2xl tabular-nums">
                {multiplier.toFixed(2)}x
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AviatorGraph;
