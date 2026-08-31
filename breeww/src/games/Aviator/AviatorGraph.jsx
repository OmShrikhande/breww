import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Trophy } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';

const AviatorGraph = ({
  multiplier,
  gameState,
  roundId,
  timerLeft = 15,
  betWindowSeconds = 15,
  recentWinners = [],
  waitingMessage,
}) => {
  const width = 800;
  const height = 400;
  const paddingX = 50;
  const paddingY = 50;

  // Logarithmic progress mapping for smooth visual flight from 1x up to 10x+
  const progress = Math.min(Math.max(0, (Math.log(Math.max(1, multiplier)) / Math.log(8))), 0.95);
  const startX = paddingX;
  const startY = height - paddingY;
  const endX = (width - paddingX * 2) * progress + paddingX;
  const endY = (height - paddingY * 2) * (1 - Math.pow(progress, 1.2)) + paddingY;
  const cpX = endX * 0.55 + startX * 0.45;
  const cpY = startY;
  
  const pathData = `M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`;
  const fillPathData = `M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY} L ${endX} ${startY} Z`;
  const tiltAngle = -8 - (progress * 16);

  const progressPct = Math.min(100, Math.max(0, ((betWindowSeconds - timerLeft) / betWindowSeconds) * 100));

  return (
    <div className="relative w-full h-full bg-[#050811] overflow-hidden flex flex-col select-none">
      {/* Top Overlay Badge */}
      <div className="absolute top-0 left-0 w-full p-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-md">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Round</span>
          <span className="text-[11px] text-amber-300 font-black tabular-nums">{roundId || '—'}</span>
        </div>
        {gameState === 'waiting' && (
          <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-lg border border-amber-500/30 backdrop-blur-md">
            <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[11px] text-amber-300 font-black tabular-nums">{timerLeft}s</span>
          </div>
        )}
      </div>

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            backgroundPosition: `${paddingX}px ${startY}px`,
          }}
        />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(230,25,25,0.15)_0%,_transparent_60%)]" />

      {/* Flight Canvas / SVG */}
      <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="flightFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e50914" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#e50914" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="curveStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff4444" />
            <stop offset="100%" stopColor="#ff0000" />
          </linearGradient>
        </defs>

        {gameState === 'running' && (
          <>
            <path d={fillPathData} fill="url(#flightFill)" />
            <path
              d={pathData}
              fill="none"
              stroke="url(#curveStroke)"
              strokeWidth="4"
              strokeLinecap="round"
              className="drop-shadow-[0_0_12px_rgba(255,0,0,0.8)]"
            />
          </>
        )}

        <AnimatePresence>
          {gameState === 'running' && (
            <motion.g
              initial={{ x: startX, y: startY, rotate: -8, opacity: 0 }}
              animate={{ x: endX, y: endY, rotate: tiltAngle, opacity: 1 }}
              transition={{ duration: 0.1, ease: 'linear' }}
            >
              {/* Aviator Red Jet Plane Asset */}
              <g transform="translate(-60, -22) scale(1.65)" className="drop-shadow-[0_0_16px_rgba(255,0,0,0.9)]">
                <path d="M0,10 C10,10 20,8 30,5 L50,5 L60,10 L50,15 L30,15 C20,12 10,10 0,10 Z" fill="#e50914" />
                <path d="M25,10 L15,-10 L40,10 Z" fill="#b80610" />
                <path d="M25,10 L15,30 L40,10 Z" fill="#b80610" />
                <path d="M10,10 L0,0 L15,10 Z" fill="#ff2222" />
                <path d="M42,7 L52,10 L42,13 Z" fill="rgba(255,255,255,0.7)" />
                {/* Propeller / Jet glow */}
                <circle cx="56" cy="10" r="3" fill="#ffffff" className="animate-ping opacity-75" />
              </g>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      {/* Multiplier / Overlay Center */}
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
              <p className="text-amber-400 font-black uppercase tracking-[0.2em] text-sm md:text-base mb-3 drop-shadow-md">
                {waitingMessage}
              </p>

              {recentWinners.length > 0 && (
                <div className="bg-black/60 rounded-2xl border border-white/10 p-3 text-left max-h-[200px] overflow-y-auto backdrop-blur-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy size={14} className="text-amber-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                      Recent Flight Winners
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {recentWinners.slice(0, 6).map((w) => (
                      <div key={w.id} className="flex items-center justify-between text-[11px]">
                        <span className="text-white/70 font-semibold">{w.user}</span>
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
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="text-red-500 font-black italic text-4xl md:text-6xl tracking-tighter mb-1 drop-shadow-[0_0_25px_rgba(239,68,68,0.8)]">
                FLEW AWAY!
              </div>
              <div className="text-white font-black text-5xl md:text-7xl tabular-nums tracking-tight drop-shadow-lg">
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
              <div className="text-white font-black text-[76px] md:text-[110px] leading-none tracking-tighter drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)] tabular-nums">
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
