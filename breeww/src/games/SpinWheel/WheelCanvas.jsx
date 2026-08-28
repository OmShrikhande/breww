import React from 'react';
import { motion } from 'framer-motion';

const WheelCanvas = ({ segments, rotation, onSpin, isSpinning }) => {
  const segmentAngle = 360 / segments.length;

  return (
    <div className="relative w-full max-w-[420px] aspect-square mx-auto flex items-center justify-center">
      
      {/* Background Glow */}
      <div className="absolute inset-[-40px] rounded-full bg-[#FFD700]/10 blur-[60px] pointer-events-none" />

      {/* Outer Pointer at the top */}
      <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-50">
        <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-[#FFD700] drop-shadow-xl"></div>
      </div>

      {/* Decorative Outer Ring with Bulbs */}
      <div className="absolute inset-0 rounded-full border-[18px] border-[#B30000] shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(0,0,0,0.4)] z-20 pointer-events-none">
        <div className="absolute inset-[-2px] rounded-full border-[2px] border-[#FFD700]/30" />
        
        {/* Lights */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              opacity: [0.4, 1, 0.4],
              scale: [0.9, 1.1, 0.9],
              backgroundColor: ['#FFD700', '#FFFFFF', '#FFD700']
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
            className="absolute w-2 h-2 rounded-full shadow-[0_0_8px_#FFD700]"
            style={{
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-195px)`,
            }}
          />
        ))}
      </div>

      {/* The Spinning Wheel Core */}
      <motion.div
        className="absolute inset-[18px] rounded-full overflow-hidden z-10 shadow-[0_0_40px_rgba(0,0,0,0.4)] border-[6px] border-[#FFD700]/40"
        animate={{ rotate: rotation }}
        transition={{ duration: 4, ease: [0.15, 0, 0.1, 1] }} // Matches index.jsx timeout
      >
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          <defs>
            <filter id="textShadow">
              <feDropShadow dx="0" dy="0.5" stdDeviation="0.5" floodOpacity="0.8"/>
            </filter>
          </defs>

          {segments.map((s, i) => {
            const startAngle = (i * segmentAngle) * (Math.PI / 180);
            const endAngle = ((i + 1) * segmentAngle) * (Math.PI / 180);
            
            const x1 = 50 + 50 * Math.cos(startAngle);
            const y1 = 50 + 50 * Math.sin(startAngle);
            const x2 = 50 + 50 * Math.cos(endAngle);
            const y2 = 50 + 50 * Math.sin(endAngle);
            
            const largeArcFlag = segmentAngle > 180 ? 1 : 0;
            const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

            // Alternating backgrounds if no color specified, but here we use provided colors
            // Let's ensure they are visible on red theme
            return (
              <g key={i}>
                <path
                  d={pathData}
                  fill={i % 2 === 0 ? '#E60000' : '#CC0000'}
                  stroke="#FFD700"
                  strokeWidth="0.2"
                />
                <text
                  x="75"
                  y="50"
                  fill="#FFD700"
                  fontSize={segments.length > 10 ? '3.5' : '5'}
                  fontWeight="950"
                  textAnchor="middle"
                  filter="url(#textShadow)"
                  className="select-none pointer-events-none"
                  transform={`rotate(${i * segmentAngle + segmentAngle / 2}, 50, 50) rotate(90, 75, 50)`}
                >
                  {s.label}
                </text>
              </g>
            );
          })}
        </svg>
      </motion.div>

      {/* Center "SPIN" Button */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 z-30 flex items-center justify-center transition-all ${isSpinning ? 'scale-95 opacity-90' : 'cursor-pointer hover:scale-105 active:scale-90'}`}
        onClick={() => !isSpinning && onSpin()}
      >
        {/* Shadow */}
        <div className="absolute inset-0 rounded-full bg-black/40 blur-md" />
        
        {/* Main Button */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#FF5C38] to-[#E60000] border-4 border-[#FFD700] shadow-xl flex flex-col items-center justify-center overflow-hidden">
          <span className="text-white font-black text-xl italic tracking-tighter drop-shadow-lg">
            SPIN
          </span>
          <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-t-full pointer-events-none" />
        </div>
      </div>

    </div>
  );
};

export default WheelCanvas;
