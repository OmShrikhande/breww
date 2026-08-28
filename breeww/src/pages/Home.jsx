import React from 'react';
import Banner from '../components/layout/Banner';
import Announcement from '../components/layout/Announcement';
import PlatformRecommendation from '../components/layout/PlatformRecommendation';
import WinningInfo from '../components/layout/WinningInfo';
import PlatformFooter from '../components/layout/PlatformFooter';
import { usePlatformGames } from '../hooks/usePlatformGames';

const Home = () => {
  const { games, loading, error, reload } = usePlatformGames();

  return (
    <div className="bg-casino-base min-h-screen">
      <Banner />
      <Announcement />
      <PlatformRecommendation games={games} loading={loading} error={error} onRetry={reload} />
      <WinningInfo />
      <PlatformFooter />
    </div>
  );
};

export default Home;
