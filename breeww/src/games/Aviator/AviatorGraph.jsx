import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const AviatorGraph = ({ multiplier, gameState }) => {
  // SVG size constants
  const width = 800;
  const height = 400;
  const paddingX = 40;
  const paddingY = 40;

  // Calculate coordinates based on current multiplier
  // The curve should grow as the multiplier increases
  const progress = Math.min((multiplier - 1) / 5, 1); 
  
  // Curved path: Starting from bottom-left
  const startX = paddingX;
  const startY = height - paddingY;
  const endX = (width - paddingX * 2) * progress + paddingX;
  const endY = (height - paddingY * 2) * (1 - progress) + paddingY;
  
  // Control point for curve
  const cpX = endX * 0.6 + startX * 0.4;
  const cpY = startY;

  const pathData = `M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`;

  return (
    <div className="relative w-full h-full bg-[#000000] overflow-hidden flex flex-col">
      {/* Top Bar with Round ID */}
      <div className="absolute top-0 left-0 w-full p-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-md border border-white/5">
          <span className="text-[10px] text-gray-500 font-bold uppercase">Round ID:</span>
          <span className="text-[10px] text-gray-300 font-bold tabular-nums">18039292</span>
          <ChevronDown size={12} className="text-gray-500" />
        </div>
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-md border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Ping: 182ms</span>
            </div>
        </div>
      </div>

      {/* Grid Lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="h-full w-full" style={{ 
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
            backgroundSize: '60px 60px',
            backgroundPosition: `${paddingX}px ${startY}px`
        }}></div>
      </div>

      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.03)_0%,_transparent_70%)]" />

      {/* Multiplier Axes Labels */}
      <div className="absolute left-2 top-0 h-full flex flex-col justify-between py-10 opacity-30 pointer-events-none">
        {[5, 4, 3, 2, 1].map(n => (
            <div key={n} className="w-1 h-1 bg-blue-400 rounded-full" />
        ))}
      </div>
      <div className="absolute bottom-2 left-0 w-full flex justify-between px-10 opacity-30 pointer-events-none">
        {[0, 1, 2, 3, 4, 5, 6, 7].map(n => (
            <div key={n} className="w-1 h-1 bg-white rounded-full" />
        ))}
      </div>

      {/* SVG Canvas */}
      <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 w-full h-full">
        {/* The Curve Path (Trailing Line) */}
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

        {/* The Airplane Icon */}
        <AnimatePresence>
          {gameState === 'running' && (
            <motion.g
              initial={{ x: startX, y: startY, rotate: 0, opacity: 0 }}
              animate={{ x: endX, y: endY, rotate: -5, opacity: 1 }}
              transition={{ duration: 0.1 }}
            >
              {/* Sleek Red Jet Plane */}
              <g transform="translate(-55, -18) scale(1.8)">
                {/* Main Fuselage */}
                <path 
                  d="M0,10 C10,10 20,8 30,5 L50,5 L60,10 L50,15 L30,15 C20,12 10,10 0,10 Z" 
                  fill="#ff0000" 
                />
                {/* Top Wing */}
                <path d="M25,10 L15,-10 L40,10 Z" fill="#ff0000" />
                {/* Bottom Wing */}
                <path d="M25,10 L15,30 L40,10 Z" fill="#ff0000" />
                {/* Vertical Tail Stabilizer */}
                <path d="M10,10 L0,0 L15,10 Z" fill="#cc0000" />
                {/* Cockpit Window */}
                <path d="M42,7 L52,10 L42,13 Z" fill="rgba(255,255,255,0.4)" />
              </g>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      {/* Central Multiplier Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
        <AnimatePresence mode="wait">
          {gameState === 'waiting' ? (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <div className="text-gray-400 font-black uppercase tracking-[0.2em] text-sm">Waiting for next round</div>
            </motion.div>
          ) : gameState === 'crashed' ? (
            <motion.div
              key="crashed"
              initial={{ opacity: 0, scale: 1.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="text-red-600 font-black italic text-6xl md:text-8xl tracking-tighter mb-2">
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
              <div className="text-white font-black text-[100px] md:text-[140px] leading-none tracking-tighter drop-shadow-2xl tabular-nums">
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
