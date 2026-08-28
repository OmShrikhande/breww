export const formatRelative = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const normalizeGame = (g = {}) => {
  const stats = g.stats || {};
  const settings = g.settings || {};
  const extra = settings.extraConfig && typeof settings.extraConfig === 'object'
    ? settings.extraConfig
    : {};

  return {
    id: g.id,
    name: g.name,
    category: g.category,
    tagline: g.tagline,
    icon: g.icon,
    accentColor: g.accentColor || g.accent_color || '#FFD700',
    gradient: g.gradient,
    status: g.status || 'inactive',
    stats: {
      playersOnline: Number(stats.playersOnline ?? 0),
      betsToday: Number(stats.betsCount ?? stats.betsToday ?? 0),
      revenueToday: Number(stats.revenue ?? stats.revenueToday ?? 0),
      winRate: Number(stats.winRate ?? 0),
    },
    settings: {
      enabled: Boolean(settings.enabled),
      maintenanceMode: Boolean(settings.maintenanceMode),
      manualResultMode: Boolean(settings.manualResultMode),
      autoResultInterval: Number(settings.autoResultInterval ?? 60),
      minBet: Number(settings.minBet ?? 10),
      maxBet: Number(settings.maxBet ?? 50000),
      houseEdge: Number(settings.houseEdge ?? 5),
      rtp: Number(settings.rtp ?? 95),
      commissionRate: Number(settings.commissionRate ?? 5),
      ...extra,
    },
  };
};

export const normalizeUser = (u = {}) => ({
  id: u.id,
  email: u.email || '',
  username: u.username || 'user',
  balance: Number(u.balance ?? 0),
  totalBets: Number(u.total_bets ?? u.totalBets ?? 0),
  totalWin: Number(u.total_win ?? u.totalWin ?? 0),
  totalLoss: Number(u.total_loss ?? u.totalLoss ?? 0),
  status: u.status || 'active',
  lastActive: formatRelative(u.last_active ?? u.lastActive),
  joined: formatDate(u.joined_at ?? u.joined),
  vip: u.vip_level || u.vip || 'None',
});

export const formatChange = (value) => {
  if (value == null || value === '') return '0%';
  const str = String(value);
  if (str.includes('%') || str.startsWith('+') || str.startsWith('-')) return str;
  const num = Number(value);
  if (Number.isNaN(num)) return str;
  return `${num >= 0 ? '+' : ''}${num}%`;
};
