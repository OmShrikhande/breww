import React, { useState, useMemo } from 'react';
import Banner from '../components/layout/Banner';
import Announcement from '../components/layout/Announcement';
import GameCategoryGrid from '../components/layout/GameCategoryGrid';
import PlatformRecommendation from '../components/layout/PlatformRecommendation';
import WinningInfo from '../components/layout/WinningInfo';
import PlatformFooter from '../components/layout/PlatformFooter';
import { usePlatformGames } from '../hooks/usePlatformGames';
import { Users, TrendingUp, Zap, Sparkles, Trophy } from 'lucide-react';

const Home = () => {
  const { games, loading, error, reload } = usePlatformGames();
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredGames = useMemo(() => {
    if (!games || activeCategory === 'all') return games || [];
    return games.filter((g) => {
      const id = String(g.id).toLowerCase();
      if (activeCategory === 'crash') return id.includes('aviator');
      if (activeCategory === 'lottery') return id.includes('colour') || id.includes('color');
      if (activeCategory === 'originals') return id.includes('mines') || id.includes('dice') || id.includes('chamber');
      if (activeCategory === 'cards') return id.includes('dragon') || id.includes('andar') || id.includes('poker') || id.includes('roulette');
      return true;
    });
  }, [games, activeCategory]);

  return (
    <div className="min-h-screen select-none animate-fadeIn pb-4">
      {/* Dynamic Animated Hero Banners */}
      <Banner />

      {/* Live Announcement Marquee */}
      <Announcement />

      {/* Interactive Category Filter Bar */}
      <GameCategoryGrid activeCategory={activeCategory} onSelectCategory={setActiveCategory} />

      {/* Platform Real-Time Statistics Ribbon */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-2 bg-[#1C0202]/95 p-3 rounded-2xl border border-amber-500/30 shadow-lg">
          <div className="text-center">
            <span className="text-[8px] sm:text-[9px] font-bold text-amber-300/60 uppercase block">Registered</span>
            <span className="text-xs sm:text-sm font-black text-white font-mono">320K+</span>
          </div>
          <div className="text-center border-x border-amber-500/20">
            <span className="text-[8px] sm:text-[9px] font-bold text-amber-300/60 uppercase block">Today's Payouts</span>
            <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">₹2.4 Cr+</span>
          </div>
          <div className="text-center">
            <span className="text-[8px] sm:text-[9px] font-bold text-amber-300/60 uppercase block">Live Players</span>
            <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono">18,420</span>
          </div>
        </div>
      </div>

      {/* Live Featured Games Grid */}
      <PlatformRecommendation
        games={filteredGames}
        loading={loading}
        error={error}
        onRetry={reload}
      />

      {/* Real-time Multiplayer Winning Feed */}
      <WinningInfo />

      {/* Breeww Platform Footer & 24/7 Support */}
      <PlatformFooter />
    </div>
  );
};

export default Home;
