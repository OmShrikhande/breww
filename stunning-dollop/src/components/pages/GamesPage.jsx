import React, { useState, useEffect, useCallback } from 'react';
import { GAME_CATEGORIES, formatCurrency, formatNumber } from '../games/gamesConfig';
import GameCard from '../games/GameCard';
import GameControlModal from '../games/GameControlModal';
import apiService from '../../configs/service';
import API_ENDPOINTS from '../../configs/api';
import { normalizeGame } from '../../utils/mappers';
import { useAuth } from '../../contexts/AuthContext';
import './GamesPage.css';

const GamesPage = ({ onControlGame }) => {
  const { canWrite } = useAuth();
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const loadGames = useCallback(async () => {
    try {
      setError('');
      const res = await apiService.get(API_ENDPOINTS.GAMES);
      setGames((res.data || []).map(normalizeGame));
    } catch (err) {
      setError(err.message || 'Failed to load games');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  const totalRevenue = games.reduce((a, b) => a + b.stats.revenueToday, 0);
  const totalPlayers = games.reduce((a, b) => a + b.stats.playersOnline, 0);
  const activeGames = games.filter((g) => g.status === 'active').length;

  const handleToggleStatus = async (gameId) => {
    if (!canWrite || busy) return;
    const game = games.find((g) => g.id === gameId);
    if (!game) return;
    const nextStatus = game.settings.enabled ? 'inactive' : 'active';
    setBusy(true);
    try {
      await apiService.patch(API_ENDPOINTS.GAME_STATUS(gameId), { status: nextStatus });
      await loadGames();
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveSettings = async (gameId, newSettings) => {
    if (!canWrite) return;
    setBusy(true);
    try {
      const {
        enabled, maintenanceMode, manualResultMode, autoResultInterval,
        minBet, maxBet, houseEdge, rtp, commissionRate, ...extraConfig
      } = newSettings;

      await apiService.patch(API_ENDPOINTS.GAME_SETTINGS(gameId), {
        enabled,
        maintenanceMode,
        manualResultMode,
        autoResultInterval,
        minBet,
        maxBet,
        houseEdge,
        rtp,
        commissionRate,
        extraConfig,
      });
      setSelectedGame(null);
      await loadGames();
    } catch (err) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setBusy(false);
    }
  };

  const handleBulk = async (action) => {
    if (!canWrite || busy) return;
    setBusy(true);
    try {
      await apiService.post(API_ENDPOINTS.GAMES_BULK_STATUS, { action });
      await loadGames();
    } catch (err) {
      setError(err.message || 'Bulk update failed');
    } finally {
      setBusy(false);
    }
  };

  const filtered = games.filter((g) => {
    if (filterCategory !== 'All' && g.category !== filterCategory) return false;
    if (filterStatus !== 'All' && g.status !== filterStatus) return false;
    if (searchQuery && !g.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return <div className="games-page"><p>Loading games…</p></div>;
  }

  return (
    <div className="games-page">
      {error && (
        <div className="games-summary-bar" style={{ marginBottom: 12 }}>
          <span className="gss-lbl">{error}</span>
          <button className="global-ctrl-btn global-ctrl-btn--enable" onClick={loadGames}>Retry</button>
        </div>
      )}

      <div className="games-summary-bar">
        <div className="games-summary-stat">
          <span className="gss-val">{activeGames} / {games.length}</span>
          <span className="gss-lbl">Games Online</span>
        </div>
        <div className="games-summary-stat">
          <span className="gss-val">{formatNumber(totalPlayers)}</span>
          <span className="gss-lbl">Players Online</span>
        </div>
        <div className="games-summary-stat">
          <span className="gss-val">{formatCurrency(totalRevenue)}</span>
          <span className="gss-lbl">Revenue Today</span>
        </div>
        {canWrite && (
          <div className="games-global-controls">
            <button className="global-ctrl-btn global-ctrl-btn--disable" disabled={busy} onClick={() => handleBulk('disable')}>
              🔴 Disable All
            </button>
            <button className="global-ctrl-btn global-ctrl-btn--enable" disabled={busy} onClick={() => handleBulk('enable')}>
              🟢 Enable All
            </button>
            <button className="global-ctrl-btn global-ctrl-btn--maintenance" disabled={busy} onClick={() => handleBulk('maintenance')}>
              🟡 Maintenance All
            </button>
          </div>
        )}
      </div>

      <div className="games-filter-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-chips">
          {GAME_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${filterCategory === cat ? 'filter-chip--active' : ''}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="status-filter">
          {['All', 'active', 'inactive', 'maintenance'].map((s) => (
            <button
              key={s}
              className={`status-filter-btn ${filterStatus === s ? 'status-filter-btn--active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="games-empty">
          <span>🎮</span>
          <p>No games match your filters</p>
          <button onClick={() => { setFilterCategory('All'); setFilterStatus('All'); setSearchQuery(''); }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="games-grid">
          {filtered.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onConfigure={canWrite ? setSelectedGame : undefined}
              onToggleStatus={canWrite ? handleToggleStatus : undefined}
              onControl={onControlGame}
            />
          ))}
        </div>
      )}

      {selectedGame && canWrite && (
        <GameControlModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
};

export default GamesPage;
