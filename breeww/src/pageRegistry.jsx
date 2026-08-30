import React from 'react';
import Layout from './layout/Layout';
import Home from './pages/Home';
import Activity from './pages/Activity';
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
      <p className="mt-2 text-sm text-white/65">This page does not exist in the Breeww multi-page app.</p>
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
  '/promotion': withLayout(Bonuses),
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

const PageRoot = () => {
  return pageRegistry[normalizePath(window.location.pathname)] ?? <NotFound />;
};

export default PageRoot;
