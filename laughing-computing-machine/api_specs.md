# Games Admin — API Specification & Database Schema

> Base URL: `http://localhost:3000/api`  
> All protected routes require: `Authorization: Bearer <token>`  
> All responses: `{ success: bool, data: any, message?: string }`

---

## 1. Authentication

| # | Endpoint | Method | Description | Expected Output |
|---|----------|--------|-------------|-----------------|
| 1.1 | `/auth/login` | `POST` | Admin login | `{ token, admin: { id, name, email, role } }` |
| 1.2 | `/auth/logout` | `POST` | Invalidate session token | `{ message }` |
| 1.3 | `/auth/me` | `GET` | Current session info | `{ id, name, email, role, lastLogin }` |
| 1.4 | `/auth/refresh` | `POST` | Refresh JWT before expiry | `{ token, expiresAt }` |
| 1.5 | `/auth/login-logs` | `GET` | Admin login history | `[{ ip, userAgent, time, success }]` |

---

## 2. Dashboard

| # | Endpoint | Method | Description | Expected Output |
|---|----------|--------|-------------|-----------------|
| 2.1 | `/dashboard/stats` | `GET` | Top KPI cards | `{ totalRevenue, activePlayers, betsToday, avgWinRate, gamesOnline, pendingIssues, changes: {} }` |
| 2.2 | `/dashboard/weekly-revenue` | `GET` | Last 7 days chart data | `[{ day, revenue, bets }]` |
| 2.3 | `/dashboard/top-games` | `GET` | Games ranked by today revenue | `[{ id, name, icon, revenueToday, accentColor }]` |
| 2.4 | `/dashboard/live-activity` | `GET` | Recent platform events feed | `[{ icon, game, action, amount, time, type }]` |
| 2.5 | `/dashboard/game-status` | `GET` | All games with live player counts | `[{ id, name, icon, status, playersOnline }]` |

---

## 3. Games Management

| # | Endpoint | Method | Description | Expected Output |
|---|----------|--------|-------------|-----------------|
| 3.1 | `/games` | `GET` | All games with settings & stats | `[{ id, name, category, status, stats: {}, settings: {} }]` |
| 3.2 | `/games/:id` | `GET` | Single game full detail | `{ id, name, category, status, stats, settings }` |
| 3.3 | `/games/:id/settings` | `PATCH` | Save game settings | `{ settings }` |
| 3.4 | `/games/:id/status` | `PATCH` | Toggle enable/disable/maintenance | `{ id, status, settings: { enabled, maintenanceMode } }` |
| 3.5 | `/games/bulk-status` | `POST` | Change all games status at once | `{ action: 'enable' | 'disable' | 'maintenance' }` → `[{ id, status }]` |

---

## 4. Live Round Control

| # | Endpoint | Method | Description | Expected Output |
|---|----------|--------|-------------|-----------------|
| 4.1 | `/games/:id/round/current` | `GET` | Current active round info | `{ roundId, status, timerLeft, totalPot, playersCount }` |
| 4.2 | `/games/:id/round/bet-distribution` | `GET` | Live bet amounts per option | `{ roundId, distribution: { [optionId]: amount }, updatedAt }` |
| 4.3 | `/games/:id/round/declare` | `POST` | Admin declares winning result | `{ result: string, roundId }` → `{ roundId, result, payoutTotal, winnersCount }` |
| 4.4 | `/games/:id/round/history` | `GET` | Past rounds list | `[{ roundId, result, totalPot, adminSet, createdAt }]` |
| 4.5 | `/games/:id/round/history/:roundId` | `GET` | Single round full detail | `{ roundId, result, bets: [], payouts: [], totalPot }` |
| 4.6 | `/games/:id/round/new` | `POST` | Force start a new round manually | `{ roundId, startsAt }` |

---

## 5. Users Management

| # | Endpoint | Method | Description | Expected Output |
|---|----------|--------|-------------|-----------------|
| 5.1 | `/users` | `GET` | Paginated user list | `{ users: [], total, page, limit }` — query: `?search&status&vip&page&limit&sortBy&sortDir` |
| 5.2 | `/users/stats` | `GET` | Summary counts for stat cards | `{ total, active, suspended, banned, diamondVips }` |
| 5.3 | `/users/:id` | `GET` | Full user profile | `{ id, username, email, balance, totalBets, totalWin, totalLoss, status, vip, joined, lastActive }` |
| 5.4 | `/users/:id/status` | `PATCH` | Ban / suspend / activate | `{ action: 'ban' | 'suspend' | 'activate' }` → `{ id, status }` |
| 5.5 | `/users/:id/balance` | `PATCH` | Adjust or reset wallet balance | `{ action: 'reset' | 'add' | 'subtract', amount? }` → `{ id, newBalance }` |
| 5.6 | `/users/:id/bets` | `GET` | User's full bet history | `[{ betId, game, amount, result, payout, createdAt }]` |
| 5.7 | `/users/:id/transactions` | `GET` | Deposits & withdrawals | `[{ txId, type, amount, status, method, createdAt }]` |
| 5.8 | `/users/:id/notes` | `POST` | Add admin note on user | `{ text }` → `{ noteId, adminId, text, createdAt }` |
| 5.9 | `/users/:id/notes` | `GET` | All admin notes on user | `[{ noteId, adminName, text, createdAt }]` |

---

## 6. Analytics

| # | Endpoint | Method | Description | Expected Output |
|---|----------|--------|-------------|-----------------|
| 6.1 | `/analytics/revenue` | `GET` | Revenue over period | `[{ label, revenue }]` — query: `?period=7d|30d` |
| 6.2 | `/analytics/bets` | `GET` | Bet count over period | `[{ label, bets }]` — query: `?period=7d|30d` |
| 6.3 | `/analytics/sessions` | `GET` | Unique sessions over period | `[{ label, users }]` — query: `?period=7d|30d` |
| 6.4 | `/analytics/game-share` | `GET` | Revenue breakdown by game | `[{ id, name, icon, accentColor, revenue, share }]` |
| 6.5 | `/analytics/peak-hours` | `GET` | Activity % by hour (0–23) | `[{ hour, activityPct }]` |
| 6.6 | `/analytics/heatmap` | `GET` | Day × hour activity grid | `{ days: string[], hours: number[], matrix: number[][] }` |
| 6.7 | `/analytics/win-loss` | `GET` | Win/loss rate per game | `[{ id, name, icon, winRate, lossRate }]` |
| 6.8 | `/analytics/quick-metrics` | `GET` | Avg session, bounce, churn etc. | `{ avgSession, bounceRate, betsPerUser, conversionRate, revenuePerUser, churnRate }` |
| 6.9 | `/analytics/export` | `POST` | Download report file | `{ format: 'csv'|'pdf', period: '7d'|'30d', type: 'revenue'|'bets'|'users' }` → file stream |

---

## 7. Transactions & Payouts

| # | Endpoint | Method | Description | Expected Output |
|---|----------|--------|-------------|-----------------|
| 7.1 | `/transactions` | `GET` | All transactions | `[{ txId, userId, username, type, amount, method, status, createdAt }]` — query: `?type&status&page&limit` |
| 7.2 | `/transactions/stats` | `GET` | Totals for payout queue | `{ totalDeposits, totalWithdrawals, pendingCount, pendingAmount }` |
| 7.3 | `/transactions/pending` | `GET` | Pending withdrawals queue | `[{ txId, userId, username, amount, method, requestedAt }]` |
| 7.4 | `/transactions/:id/approve` | `PATCH` | Approve withdrawal payout | — → `{ txId, status: 'approved', processedAt }` |
| 7.5 | `/transactions/:id/reject` | `PATCH` | Reject withdrawal with reason | `{ reason }` → `{ txId, status: 'rejected' }` |

---

## 8. Settings

| # | Endpoint | Method | Description | Expected Output |
|---|----------|--------|-------------|-----------------|
| 8.1 | `/settings` | `GET` | All settings groups | `{ general, security, payments, notifications, api }` |
| 8.2 | `/settings/general` | `PATCH` | Save general settings | `{ siteName, siteUrl, supportEmail, currency, timezone, maintenanceMode, ... }` |
| 8.3 | `/settings/security` | `PATCH` | Save security settings | `{ twoFactorRequired, sessionTimeout, maxLoginAttempts, rateLimiting, ... }` |
| 8.4 | `/settings/payments` | `PATCH` | Save payment settings | `{ minDeposit, maxDeposit, minWithdrawal, maxWithdrawal, withdrawalFee, upiEnabled, ... }` |
| 8.5 | `/settings/notifications` | `PATCH` | Save notification settings | `{ emailAlerts, bigWinAlert, bigWinThreshold, dailyReport, ... }` |
| 8.6 | `/settings/api` | `PATCH` | Save API / webhook settings | `{ webhookUrl, webhookEnabled, rateLimitPerMin, allowedOrigins, loggingEnabled }` |
| 8.7 | `/settings/api-key` | `GET` | Get masked API key | `{ keyPreview: 'sk_live_••••xxxx' }` |
| 8.8 | `/settings/api-key/rotate` | `POST` | Regenerate API key | `{ newKey, rotatedAt }` |
| 8.9 | `/settings/webhook/test` | `POST` | Ping webhook endpoint | `{ status, responseTime, responseCode }` |

---

## 9. Notifications

| # | Endpoint | Method | Description | Expected Output |
|---|----------|--------|-------------|-----------------|
| 9.1 | `/notifications` | `GET` | Admin notification inbox | `[{ id, title, body, type, read, createdAt }]` |
| 9.2 | `/notifications/unread-count` | `GET` | Badge count | `{ count }` |
| 9.3 | `/notifications/:id/read` | `PATCH` | Mark one as read | `{ id, read: true }` |
| 9.4 | `/notifications/read-all` | `PATCH` | Mark all read | `{ updated }` |
| 9.5 | `/notifications/test` | `POST` | Send test alert | `{ channel: 'email'|'sms' }` → `{ sent }` |

---

## Database Schema

> Engine: **MySQL / PostgreSQL**  
> All tables have `created_at TIMESTAMP DEFAULT NOW()` and `updated_at TIMESTAMP` unless noted.

---

### `admins`
```sql
id            INT PK AUTO_INCREMENT
name          VARCHAR(100)
email         VARCHAR(150) UNIQUE
password_hash VARCHAR(255)
role          ENUM('superadmin','admin','viewer') DEFAULT 'admin'
last_login    TIMESTAMP NULL
is_active     BOOLEAN DEFAULT TRUE
```

### `admin_sessions`
```sql
id         INT PK AUTO_INCREMENT
admin_id   INT FK → admins.id
token_hash VARCHAR(255)
ip_address VARCHAR(45)
user_agent TEXT
expires_at TIMESTAMP
```

### `admin_login_logs`
```sql
id         INT PK AUTO_INCREMENT
admin_id   INT FK → admins.id NULL
email      VARCHAR(150)
ip_address VARCHAR(45)
success    BOOLEAN
created_at TIMESTAMP
```

---

### `games`
```sql
id           VARCHAR(50) PK          -- 'colour', 'aviator', etc.
name         VARCHAR(100)
category     VARCHAR(50)
icon         VARCHAR(10)
tagline      TEXT
accent_color VARCHAR(20)
gradient     TEXT
status       ENUM('active','inactive','maintenance') DEFAULT 'active'
```

### `game_settings`
```sql
id                   INT PK AUTO_INCREMENT
game_id              VARCHAR(50) FK → games.id UNIQUE
enabled              BOOLEAN DEFAULT TRUE
maintenance_mode     BOOLEAN DEFAULT FALSE
manual_result_mode   BOOLEAN DEFAULT FALSE
auto_result_interval INT DEFAULT 60        -- seconds
min_bet              DECIMAL(12,2)
max_bet              DECIMAL(12,2)
house_edge           DECIMAL(5,2)
rtp                  DECIMAL(5,2)
commission_rate      DECIMAL(5,2)
extra_config         JSON                  -- game-specific fields
updated_at           TIMESTAMP
```

### `game_stats_daily`
```sql
id              INT PK AUTO_INCREMENT
game_id         VARCHAR(50) FK → games.id
date            DATE
players_online  INT DEFAULT 0
bets_count      INT DEFAULT 0
revenue         DECIMAL(14,2) DEFAULT 0
win_rate        DECIMAL(5,2) DEFAULT 0
UNIQUE(game_id, date)
```

---

### `game_rounds`
```sql
id           BIGINT PK AUTO_INCREMENT
game_id      VARCHAR(50) FK → games.id
round_number INT
status       ENUM('open','closed','declared','completed')
result       VARCHAR(50) NULL          -- winning option id
admin_set    BOOLEAN DEFAULT FALSE     -- true if admin declared
total_pot    DECIMAL(14,2) DEFAULT 0
winners_count INT DEFAULT 0
payout_total  DECIMAL(14,2) DEFAULT 0
started_at   TIMESTAMP
closed_at    TIMESTAMP NULL
declared_at  TIMESTAMP NULL
```

### `round_bets`
```sql
id        BIGINT PK AUTO_INCREMENT
round_id  BIGINT FK → game_rounds.id
user_id   INT FK → users.id
option_id VARCHAR(50)               -- e.g. 'red', 'dragon', '3'
amount    DECIMAL(12,2)
payout    DECIMAL(12,2) NULL
won       BOOLEAN NULL
placed_at TIMESTAMP
```

---

### `users`
```sql
id            INT PK AUTO_INCREMENT
username      VARCHAR(50) UNIQUE
email         VARCHAR(150) UNIQUE
phone         VARCHAR(20) NULL
password_hash VARCHAR(255)
status        ENUM('active','suspended','banned') DEFAULT 'active'
vip_level     ENUM('None','Bronze','Silver','Gold','Platinum','Diamond') DEFAULT 'None'
balance       DECIMAL(14,2) DEFAULT 0.00
total_bets    INT DEFAULT 0
total_win     DECIMAL(14,2) DEFAULT 0.00
total_loss    DECIMAL(14,2) DEFAULT 0.00
last_active   TIMESTAMP NULL
joined_at     TIMESTAMP DEFAULT NOW()
```

### `user_balance_ledger`
```sql
id          BIGINT PK AUTO_INCREMENT
user_id     INT FK → users.id
type        ENUM('deposit','withdrawal','bet','win','bonus','admin_adjust')
amount      DECIMAL(12,2)
balance_after DECIMAL(14,2)
ref_id      VARCHAR(100) NULL       -- tx or bet id
note        TEXT NULL
created_at  TIMESTAMP
```

### `user_admin_notes`
```sql
id         INT PK AUTO_INCREMENT
user_id    INT FK → users.id
admin_id   INT FK → admins.id
note       TEXT
created_at TIMESTAMP
```

---

### `transactions`
```sql
id             BIGINT PK AUTO_INCREMENT
user_id        INT FK → users.id
type           ENUM('deposit','withdrawal')
amount         DECIMAL(12,2)
fee            DECIMAL(10,2) DEFAULT 0.00
net_amount     DECIMAL(12,2)
method         ENUM('upi','net_banking','card','crypto')
status         ENUM('pending','approved','rejected','processing')
gateway_ref    VARCHAR(200) NULL
rejection_note TEXT NULL
requested_at   TIMESTAMP
processed_at   TIMESTAMP NULL
processed_by   INT FK → admins.id NULL
```

---

### `platform_settings`
```sql
id          INT PK AUTO_INCREMENT
group_name  VARCHAR(50)             -- 'general','security','payments','notifications','api'
key         VARCHAR(100)
value       TEXT
updated_by  INT FK → admins.id NULL
updated_at  TIMESTAMP
UNIQUE(group_name, key)
```

### `api_keys`
```sql
id           INT PK AUTO_INCREMENT
key_hash     VARCHAR(255) UNIQUE
key_preview  VARCHAR(20)            -- 'sk_live_••••xxxx'
is_active    BOOLEAN DEFAULT TRUE
rotated_at   TIMESTAMP NULL
created_by   INT FK → admins.id
created_at   TIMESTAMP
```

### `webhook_logs`
```sql
id            BIGINT PK AUTO_INCREMENT
event_type    VARCHAR(100)
payload       JSON
response_code INT NULL
response_time INT NULL               -- ms
success       BOOLEAN
created_at    TIMESTAMP
```

---

### `notifications`
```sql
id         INT PK AUTO_INCREMENT
type       ENUM('big_win','new_user','maintenance','security','payout','system')
title      VARCHAR(200)
body       TEXT
read       BOOLEAN DEFAULT FALSE
created_at TIMESTAMP
```

### `activity_log`
```sql
id         BIGINT PK AUTO_INCREMENT
type       ENUM('win','loss','join','game','sys')
game_id    VARCHAR(50) NULL
user_id    INT NULL
action     TEXT
amount     DECIMAL(12,2) NULL
created_at TIMESTAMP
```

---

## Index Recommendations

```sql
-- Round queries (most frequent in live control)
INDEX ON game_rounds(game_id, status)
INDEX ON game_rounds(game_id, started_at DESC)
INDEX ON round_bets(round_id, option_id)

-- User queries
INDEX ON users(status)
INDEX ON users(vip_level)
INDEX ON users(last_active)

-- Transaction queue
INDEX ON transactions(status, type)
INDEX ON transactions(user_id)

-- Analytics
INDEX ON game_stats_daily(date DESC)
INDEX ON game_stats_daily(game_id, date)
INDEX ON activity_log(created_at DESC)
```

---

## Auth Flow

```
POST /auth/login
  → validate email + password
  → return JWT (24h expiry)
  → store: admin_sessions row

All requests → middleware:
  → extract Bearer token
  → verify JWT signature
  → check admin_sessions (not expired, not revoked)
  → attach admin to request
```

---

## Key Design Decisions

- **`game_settings.extra_config JSON`** — stores game-specific fields (e.g. `redMultiplier`, `maxMultiplier`, `gridSize`) without extra tables per game type.
- **`round_bets`** — one row per user per round per option; `payout` and `won` filled after result is declared.
- **`user_balance_ledger`** — full audit trail; `users.balance` is a denormalized cache for fast reads.
- **`platform_settings`** key-value store — allows adding new settings without schema migration.
- **`game_stats_daily`** — pre-aggregated daily stats for fast dashboard queries; updated via cron or trigger after each round completes.
