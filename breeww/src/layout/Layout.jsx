import React from 'react';
import Header from '../components/layout/Header';
import BottomNavbar from '../components/layout/BottomNavbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#070b19] flex justify-center selection:bg-amber-500 selection:text-black">
      <div className="w-full max-w-md casino-shell-bg text-white relative shadow-2xl border-x border-amber-500/20 flex flex-col min-h-screen overflow-x-hidden">
        <Header />
        <main className="flex-1 pt-14 pb-20 overflow-y-auto custom-scrollbar">
          {children}
        </main>
        <BottomNavbar />
      </div>
    </div>
  );
};

export default Layout;
