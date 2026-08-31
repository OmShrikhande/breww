import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout/Layout';
import Home from './pages/Home';
import Activity from './pages/Activity';
import Bonuses from './pages/Bonuses';
import Account from './pages/Account';
import Wallet from './pages/Wallet';
import InviteWheel from './pages/InviteWheel';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import Register from './pages/Register';

// Games
import Aviator from './games/Aviator';
import ColorPrediction from './games/ColorPrediction';
import Mines from './games/Mines';
import SpinWheel from './games/SpinWheel';
import Dice from './games/Dice';
import DragonTiger from './games/DragonTiger';
import AndarBahar from './games/AndarBahar';
import Plinko from './games/Plinko';
import Poker from './games/Poker';
import ChamberRisk from './games/ChamberRisk';
import Roulette from './games/Roulette';
import { useAuth } from './context/AuthContext';

// Strict Hard-Wall Auth Gate Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f2a] flex flex-col items-center justify-center text-white select-none">
        <div className="w-12 h-12 rounded-full border-4 border-[#FFD700] border-t-transparent animate-spin mb-4 shadow-[0_0_20px_rgba(255,215,0,0.4)]" />
        <span className="text-xl font-black italic tracking-tighter text-white">Breeww</span>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#FFD700] mt-1">Securing Connection…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login & Register */}
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

        {/* Protected App Pages with Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="activity" element={<Activity />} />
          <Route path="promotion" element={<Bonuses />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="account" element={<Account />} />
        </Route>

        {/* Protected Full-Screen Pages */}
        <Route path="/invite-wheel" element={<ProtectedRoute><InviteWheel /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
        <Route path="/promotion" element={<ProtectedRoute><Bonuses /></ProtectedRoute>} />

        {/* Protected Game Routes */}
        <Route path="/game/aviator" element={<ProtectedRoute><Aviator /></ProtectedRoute>} />
        <Route path="/game/color-prediction" element={<ProtectedRoute><ColorPrediction /></ProtectedRoute>} />
        <Route path="/game/mines" element={<ProtectedRoute><Mines /></ProtectedRoute>} />
        <Route path="/game/spin-wheel" element={<ProtectedRoute><SpinWheel /></ProtectedRoute>} />
        <Route path="/game/dice" element={<ProtectedRoute><Dice /></ProtectedRoute>} />
        <Route path="/game/dragon-tiger" element={<ProtectedRoute><DragonTiger /></ProtectedRoute>} />
        <Route path="/game/andar-bahar" element={<ProtectedRoute><AndarBahar /></ProtectedRoute>} />
        <Route path="/game/plinko" element={<ProtectedRoute><Plinko /></ProtectedRoute>} />
        <Route path="/game/poker" element={<ProtectedRoute><Poker /></ProtectedRoute>} />
        <Route path="/game/chamber-risk" element={<ProtectedRoute><ChamberRisk /></ProtectedRoute>} />
        <Route path="/game/roulette" element={<ProtectedRoute><Roulette /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
