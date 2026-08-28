import React from 'react';
import Banner from '../components/layout/Banner';
import Announcement from '../components/layout/Announcement';
import GameCategoryGrid from '../components/layout/GameCategoryGrid';
import PlatformRecommendation from '../components/layout/PlatformRecommendation';
import WinningInfo from '../components/layout/WinningInfo';
import EarningsChart from '../components/layout/EarningsChart';
import PlatformFooter from '../components/layout/PlatformFooter';
import { GAMES } from '../constants/games';

const Home = () => {
  return (
    <div className="bg-[#1B233D] min-h-screen relative">
      <Banner />
      <Announcement />
      <GameCategoryGrid />
      <PlatformRecommendation games={GAMES.slice(0, 9)} />
      <WinningInfo />
      <EarningsChart />
      <PlatformFooter />
    </div>
  );
};

export default Home;
