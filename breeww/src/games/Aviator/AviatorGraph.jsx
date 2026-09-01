import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
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
  const paddingX = 45;
  const paddingY = 45;

  // Logarithmic visual progress mapping for smooth flight acceleration
  const progress = Math.min(Math.max(0, (Math.log(Math.max(1, multiplier)) / Math.log(8))), 0.94);
  const startX = paddingX;
  const startY = height - paddingY;
  const endX = (width - paddingX * 2) * progress + paddingX;
  const endY = (height - paddingY * 2) * (1 - Math.pow(progress, 1.25)) + paddingY;
  const cpX = endX * 0.58 + startX * 0.42;
  const cpY = startY;
  
  const pathData = `M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`;
  const fillPathData = `M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY} L ${endX} ${startY} Z`;
  const tiltAngle = -6 - (progress * 18);

  const progressPct = Math.min(100, Math.max(0, ((betWindowSeconds - timerLeft) / betWindowSeconds) * 100));

  return (
    <div className="relative w-full h-full bg-[#050811] overflow-hidden flex flex-col select-none">
      {/* Top Overlay Badge */}
      <div className="absolute top-0 left-0 w-full p-2.5 sm:p-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-md">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Round</span>
          <span className="text-[11px] text-amber-300 font-black tabular-nums">#{roundId || '—'}</span>
        </div>
        {gameState === 'waiting' && (
          <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-lg border border-amber-500/30 backdrop-blur-md">
            <div className="w-20 sm:w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
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

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(230,25,25,0.18)_0%,_transparent_65%)]" />

      {/* Flight Canvas / SVG */}
      <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="flightFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e50914" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#e50914" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#e50914" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="curveStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff4444" />
            <stop offset="100%" stopColor="#e50914" />
          </linearGradient>
          
          {/* Authentic Spribe Aviator Plane Shading Gradients */}
          <linearGradient id="fuselageGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF3B47" />
            <stop offset="45%" stopColor="#E50914" />
            <stop offset="100%" stopColor="#88040B" />
          </linearGradient>

          <linearGradient id="wingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF525F" />
            <stop offset="50%" stopColor="#E50914" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>

          <linearGradient id="lowerWingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="70%" stopColor="#991B1B" />
            <stop offset="100%" stopColor="#450A0A" />
          </linearGradient>

          <linearGradient id="tailGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF3B47" />
            <stop offset="60%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </linearGradient>

          <linearGradient id="cockpitGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="35%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>

          <radialGradient id="propBlurGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="thrustGlow" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#EF4444" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gameState === 'running' && (
          <>
            <path d={fillPathData} fill="url(#flightFill)" />
            <path
              d={pathData}
              fill="none"
              stroke="url(#curveStroke)"
              strokeWidth="5"
              strokeLinecap="round"
              className="drop-shadow-[0_0_15px_rgba(255,0,0,0.85)]"
            />
          </>
        )}

        <AnimatePresence>
          {gameState === 'running' && (
            <motion.g
              initial={{ x: startX, y: startY, rotate: -6, opacity: 0 }}
              animate={{ x: endX, y: endY, rotate: tiltAngle, opacity: 1 }}
              transition={{ duration: 0.08, ease: 'linear' }}
            >
              {/* High-Definition Spribe Aviator Red Aerobatic Monoplane */}
              <g transform="translate(-75, -28) scale(2.1)" className="drop-shadow-[0_4px_20px_rgba(229,9,20,0.95)]">
                {/* Engine Exhaust Thruster Flame & Glow Trail */}
                <g className="thrust-flame">
                  <path d="M-6,14 Q-18,14 -28,15 Q-16,16.5 -6,17.5 Z" fill="url(#thrustGlow)" />
                  <path d="M-4,14.5 Q-12,15.2 -18,15.5 Q-10,16.2 -4,17 Z" fill="#FFFBEB" />
                </g>

                {/* Under-Wing Shading */}
                <path d="M18,17 L-6,29 L0,31 L24,19 Z" fill="#700308" opacity="0.6" />

                {/* Main Fuselage (Streamlined Red Body) */}
                <path d="M-10,13 C-1,11 16,9 38,10 C46,11 54,13 60,15.5 C54,18 46,20 38,21 C16,22 -1,20 -10,18 Z" fill="url(#fuselageGrad)" />

                {/* Fuselage Racing Stripe Decal */}
                <path d="M-6,13.5 C4,12 22,10.8 40,11.8 C48,12.8 54,14 58,15 C52,15.5 44,15 34,14.5 C16,14 -1,14.5 -6,15 Z" fill="#FFFFFF" opacity="0.9" />

                {/* Cockpit Canopy Glass & Shine */}
                <path d="M15,10.5 C21,7.2 30,7.2 38,10.5 C30,11.5 21,11.5 15,10.5 Z" fill="url(#cockpitGrad)" stroke="#CBD5E1" strokeWidth="0.6" />
                <path d="M19,9 C25,7.8 31,8 35,9.5 C29,8.8 23,8.8 19,9 Z" fill="#FFFFFF" opacity="0.85" />

                {/* Main Top Aerodynamic Wing */}
                <path d="M14,14.5 L-6,-8 L5,-9 L32,13.5 Z" fill="url(#wingGrad)" />
                <path d="M-4,-7 L3,-8 L28,13 L22,13.5 Z" fill="#FFFFFF" opacity="0.85" />
                <path d="M-6,-8 L-8,-10.5 L-4,-9.5 L-2,-7 Z" fill="#DC2626" stroke="#7F1D1D" strokeWidth="0.4" />

                {/* Lower Underbody Winglet */}
                <path d="M18,16.5 L-2,33 L7,34 L31,17.5 Z" fill="url(#lowerWingGrad)" />
                <path d="M-1,32 L4,33 L26,18 L22,17.5 Z" fill="#FFFFFF" opacity="0.75" />

                {/* Tail Stabilizers & Vertical Rudder */}
                <path d="M-8,14 L-21,7.5 L-17,6.5 L-6,13 Z" fill="#B91C1C" />
                <path d="M-8,17 L-21,23.5 L-17,24.5 L-6,18 Z" fill="#991B1B" />
                <path d="M-5,13.5 L-19,-2 L-13,-3 L-3,13 Z" fill="url(#tailGrad)" />
                <path d="M-16,2 L-12,1 L-8,9 L-11,10 Z" fill="#FFFFFF" />

                {/* Front Nose Cowling & Spinner Cone */}
                <path d="M54,13 C59,14 61,15.5 61,16 C61,16.5 59,18 54,19 Z" fill="#B91C1C" />
                <path d="M59,14.5 Q64,16 59,17.5 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="0.4" />

                {/* Spinning Propeller Blades & Blur Disc */}
                <ellipse cx="60" cy="16" rx="2.5" ry="16" fill="url(#propBlurGrad)" opacity="0.75" />
                <line x1="60" y1="3" x2="60" y2="29" stroke="#FFFFFF" strokeWidth="1.6" opacity="0.9" strokeLinecap="round" />
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
              <p className="text-amber-400 font-black uppercase tracking-[0.2em] text-xs sm:text-sm md:text-base mb-2.5 drop-shadow-md">
                {waitingMessage}
              </p>

              {recentWinners.length > 0 && (
                <div className="bg-black/60 rounded-2xl border border-white/10 p-2.5 sm:p-3 text-left max-h-[160px] sm:max-h-[200px] overflow-y-auto backdrop-blur-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy size={13} className="text-amber-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                      Recent Flight Winners
                    </span>
                  </div>
                  <div className="space-y-1">
                    {recentWinners.slice(0, 5).map((w) => (
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
              <div className="text-red-500 font-black italic text-3xl sm:text-5xl md:text-6xl tracking-tighter mb-1 drop-shadow-[0_0_25px_rgba(239,68,68,0.8)]">
                FLEW AWAY!
              </div>
              <div className="text-white font-black text-4xl sm:text-6xl md:text-7xl tabular-nums tracking-tight drop-shadow-lg">
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
              <div className="text-white font-black text-5xl sm:text-7xl md:text-8xl leading-none tracking-tighter drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)] tabular-nums">
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
