import React from 'react';
import Layout from './layout/Layout';
import Home from './pages/Home';
import Activity from './pages/Activity';
import Promotion from './pages/Promotion';
import Bonuses from './pages/Bonuses';
import Account from './pages/Account';
import WalletPage from './pages/Wallet';
import InviteWheel from './pages/InviteWheel';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import Register from './pages/Register';
import Aviator from './games/Aviator';
import ColorPrediction from './games/ColorPrediction';
import Mines from './games/Mines';
import SpinWheel from './games/SpinWheel';
import Dice from './games/Dice';
import DragonTiger from './games/DragonTiger';
import Plinko from './games/Plinko';
import Poker from './games/Poker';
import ChamberRisk from './games/ChamberRisk';
import Roulette from './games/Roulette';
import AndarBahar from './games/AndarBahar';
import { normalizePath } from './lib/navigation';
import { useAuth } from './context/AuthContext';

const withLayout = (PageComponent) => (
  <Layout>
    {React.createElement(PageComponent)}
  </Layout>
);

const NotFound = () => (
  <Layout>
    <div className="px-6 py-10 text-center text-white">
      <div className="text-[10px] font-black uppercase tracking-[0.36em] text-white/50">404</div>
      <h1 className="mt-3 text-3xl font-black">Page Not Found</h1>
      <p className="mt-2 text-sm text-white/65">This page does not exist in the Breeww gaming app.</p>
      <a
        href="/"
        className="mt-6 inline-flex rounded-full border border-sky-300/20 bg-sky-400/10 px-5 py-2 text-sm font-black uppercase tracking-[0.2em] text-sky-200"
      >
        Go Home
      </a>
    </div>
  </Layout>
);

const pageRegistry = {
  '/': withLayout(Home),
  '/activity': withLayout(Activity),
  '/promotion': withLayout(Promotion),
  '/bonuses': withLayout(Bonuses),
  '/wallet': withLayout(WalletPage),
  '/account': withLayout(Account),
  '/invite-wheel': <InviteWheel />,
  '/notifications': <Notifications />,
  '/login': <Login />,
  '/register': <Register />,
  '/game/aviator': <Aviator />,
  '/game/color-prediction': <ColorPrediction />,
  '/game/mines': <Mines />,
  '/game/spin-wheel': <SpinWheel />,
  '/game/dice': <Dice />,
  '/game/dragon-tiger': <DragonTiger />,
  '/game/plinko': <Plinko />,
  '/game/poker': <Poker />,
  '/game/chamber-risk': <ChamberRisk />,
  '/game/roulette': <Roulette />,
  '/game/andar-bahar': <AndarBahar />,
};

const PUBLIC_PATHS = ['/login', '/register'];

const PageRoot = () => {
  const { isAuthenticated, loading } = useAuth();
  const currentPath = normalizePath(window.location.pathname);
  const isPublic = PUBLIC_PATHS.includes(currentPath);

  // 1. Loading splash
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f2a] flex flex-col items-center justify-center text-white select-none">
        <div className="w-12 h-12 rounded-full border-4 border-[#FFD700] border-t-transparent animate-spin mb-4 shadow-[0_0_20px_rgba(255,215,0,0.4)]" />
        <span className="text-xl font-black italic tracking-tighter text-white">Breeww</span>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#FFD700] mt-1">Securing Connection…</p>
      </div>
    );
  }

  // 2. Strict Hard-Wall Gate: Unauthenticated users CANNOT view Home or any game
  if (!isAuthenticated && !isPublic) {
    return <Login />;
  }

  // 3. Authenticated user visiting /login or /register -> automatically show Home
  if (isAuthenticated && isPublic) {
    return pageRegistry['/'] ?? withLayout(Home);
  }

  return pageRegistry[currentPath] ?? <NotFound />;
};

export default PageRoot;
