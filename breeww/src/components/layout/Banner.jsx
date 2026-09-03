import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Zap, Gift, Flame, Trophy, Gem } from 'lucide-react';
import { navigateTo } from '../../lib/navigation';

const SLIDES = [
  {
    id: 1,
    tag: 'NEW PLAYER SPECIAL',
    tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    title: 'FIRST DEPOSIT BONUS',
    highlight: 'UP TO ₹10,000 CASH',
    subtitle: '100% Instant Match · Fast UPI Deposits',
    cta: 'Claim Bonus',
    href: '/wallet',
    icon: Gift,
    badge: '100% BONUS',
    bgGradient: 'from-[#8B0000] via-[#450505] to-[#1A0101]',
    accentGlow: 'rgba(255, 215, 0, 0.35)',
    graphic: '💰',
  },
  {
    id: 2,
    tag: '🔥 HOTTEST LIVE CRASH',
    tagColor: 'bg-red-500/20 text-red-300 border-red-500/40',
    title: 'AVIATOR HIGH FLYER',
    highlight: 'MULTIPLIER UP TO 1000×',
    subtitle: 'Cash out before the plane flies away!',
    cta: 'Play Aviator',
    href: '/game/aviator',
    icon: Flame,
    badge: 'LIVE 60FPS',
    bgGradient: 'from-[#B21818] via-[#5A0606] to-[#1A0101]',
    accentGlow: 'rgba(239, 68, 68, 0.4)',
    graphic: '🚀',
  },
  {
    id: 3,
    tag: 'FREE DAILY CASHOUT',
    tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    title: 'INVITE WHEEL & WIN ₹500',
    highlight: 'GUARANTEED WITHDRAWAL',
    subtitle: 'Spin the wheel & withdraw cash directly to UPI',
    cta: 'Spin Wheel',
    href: '/invite-wheel',
    icon: Trophy,
    badge: 'GET ₹500',
    bgGradient: 'from-[#A11B1B] via-[#4D0606] to-[#140202]',
    accentGlow: 'rgba(255, 215, 0, 0.45)',
    graphic: '🎡',
  },
  {
    id: 4,
    tag: 'PROVABLY FAIR · 99.2% RTP',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    title: 'MINES DIAMOND QUEST',
    highlight: 'UNCOVER 💎 GEMS',
    subtitle: 'Pick your mines · Cash out anytime safely',
    cta: 'Hunt Gems',
    href: '/game/mines',
    icon: Gem,
    badge: 'INSTANT WIN',
    bgGradient: 'from-[#1A4D2E] via-[#0F2E1B] to-[#140202]',
    accentGlow: 'rgba(16, 185, 129, 0.35)',
    graphic: '💎',
  },
  {
    id: 5,
    tag: 'LIVE DEALER 30s ROUNDS',
    tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    title: 'ANDAR BAHAR & WINGO',
    highlight: 'MATCH THE JOKER CARD',
    subtitle: 'Lightning-fast 30s rounds & color prediction',
    cta: 'Play Live',
    href: '/game/andar-bahar',
    icon: Zap,
    badge: 'LIVE DEALER',
    bgGradient: 'from-[#701A1A] via-[#3B0808] to-[#140202]',
    accentGlow: 'rgba(255, 215, 0, 0.35)',
    graphic: '🃏',
  },
];

const AUTO_PLAY_INTERVAL = 4500;

const Banner = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, AUTO_PLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e) => {
    setIsPaused(false);
    if (!touchStartX.current) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) nextSlide();
    else if (diff < -40) prevSlide();
    touchStartX.current = null;
  };

  const slide = SLIDES[current];

  return (
    <div
      className="relative w-full overflow-hidden mb-3 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full aspect-[2/1] sm:aspect-[2.2/1] max-h-[260px] overflow-hidden border-b border-amber-500/30 shadow-2xl bg-black">
        <AnimatePresence mode="wait">
          <Motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 0.98, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.98, x: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            onClick={() => navigateTo(slide.href)}
            className={`absolute inset-0 bg-gradient-to-br ${slide.bgGradient} p-4 sm:p-6 flex flex-col justify-between cursor-pointer group`}
            style={{
              boxShadow: `inset 0 0 60px ${slide.accentGlow}`,
            }}
          >
            {/* Background Graphic */}
            <div className="absolute -right-4 -bottom-4 text-7xl sm:text-8xl opacity-20 pointer-events-none filter blur-[1px] group-hover:scale-110 group-hover:opacity-30 transition-all duration-700">
              {slide.graphic}
            </div>

            {/* Top Bar */}
            <div className="flex items-center justify-between z-10">
              <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${slide.tagColor} flex items-center gap-1 backdrop-blur-md shadow-sm`}>
                <Sparkles size={11} /> {slide.tag}
              </span>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-black/40 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30 backdrop-blur-md">
                {slide.badge}
              </span>
            </div>

            {/* Middle Content */}
            <div className="z-10 my-auto">
              <h2 className="text-xl sm:text-3xl font-black text-white uppercase italic tracking-tight drop-shadow-lg leading-none mb-1 group-hover:translate-x-1 transition-transform">
                {slide.title}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-lg font-black text-amber-400 tracking-wide drop-shadow">
                  {slide.highlight}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-white/70 font-medium mt-0.5 line-clamp-1">
                {slide.subtitle}
              </p>
            </div>

            {/* Bottom CTA */}
            <div className="flex items-center justify-between z-10 pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateTo(slide.href);
                }}
                className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 active:scale-95 text-red-950 font-black text-xs sm:text-sm px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl shadow-lg uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border-2 border-white/80"
              >
                <span>{slide.cta}</span>
                <ArrowRight size={14} />
              </button>

              <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">
                {current + 1} / {SLIDES.length}
              </span>
            </div>
          </Motion.div>
        </AnimatePresence>

        {/* Prev / Next Buttons */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 border border-amber-500/30 text-amber-300 hover:text-white flex items-center justify-center backdrop-blur-md transition-all z-20 cursor-pointer active:scale-90"
          aria-label="Previous slide"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 border border-amber-500/30 text-amber-300 hover:text-white flex items-center justify-center backdrop-blur-md transition-all z-20 cursor-pointer active:scale-90"
          aria-label="Next slide"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="flex items-center justify-center gap-1.5 py-2 bg-[#140202]/80 backdrop-blur-sm">
        {SLIDES.map((s, idx) => {
          const isActive = current === idx;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrent(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                isActive ? 'w-7 bg-amber-400 shadow-[0_0_8px_rgba(255,215,0,0.8)]' : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Banner;
