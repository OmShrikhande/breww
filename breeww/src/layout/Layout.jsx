import React from 'react';
import Header from '../components/layout/Header';
import BottomNavbar from '../components/layout/BottomNavbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#5a6270] flex justify-center">
      <div className="w-full max-w-md bg-casino-base text-white relative shadow-2xl border-x border-white/5 flex flex-col min-h-screen">
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
