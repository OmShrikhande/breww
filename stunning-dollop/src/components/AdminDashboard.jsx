import React, { useState } from 'react';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import DashboardPage from './pages/DashboardPage';
import GamesPage from './pages/GamesPage';
import UsersPage from './pages/UsersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import GameControlPage from './games/GameControlPage';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [controlGame, setControlGame] = useState(null);

  const handleNavigate = (page) => {
    setControlGame(null);
    setActivePage(page);
  };

  const renderPage = () => {
    if (controlGame) {
      return (
        <GameControlPage
          game={controlGame}
          onBack={() => setControlGame(null)}
        />
      );
    }
    switch (activePage) {
      case 'dashboard': return <DashboardPage />;
      case 'games':     return <GamesPage onControlGame={setControlGame} />;
      case 'users':     return <UsersPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'settings':  return <SettingsPage />;
      default:          return <DashboardPage />;
    }
  };

  return (
    <div className={`admin-layout ${sidebarCollapsed ? 'admin-layout--collapsed' : ''}`}>
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(p => !p)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="admin-main">
        <Header
          activePage={activePage}
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
        />
        <main className="admin-page-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
