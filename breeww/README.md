# Breeww — Player Frontend

Mobile-first **player** casino UI (INR): lobby, games, wallet, promotions, account.

Uses the **player** API from `laughing-computing-machine` (same deploy as admin):

| Environment | `VITE_API_BASE_URL` |
|-------------|---------------------|
| Local (combined) | `http://localhost:3000/player/api` |
| Local (standalone player) | `http://localhost:3001/api` |
| Production | `https://YOUR-HOST/player/api` |

| Project | Role |
|---------|------|
| **breeww** (this) | Player frontend |
| `stunning-dollop` | Admin dashboard → `/api` |
| `laughing-computing-machine` | Admin + player APIs (one deploy) |

## Features

- Login / register (phone or email) against player API
- Wallet balance from API
- Roulette bets via `POST …/roulette/bet`
- Lobby games, account, promotions UI

## Tech

React 19, Vite 7, Tailwind, Framer Motion, Lucide, matter-js (Plinko), Playwright.

## Setup

```bash
# Backend first
cd path/to/laughing-computing-machine
npm install && npm run dev

# Player UI
cd path/to/breeww
cp .env.example .env    # VITE_API_BASE_URL=http://localhost:3000/player/api
npm install && npm run dev
```

Demo player: **`player@breeww.com` / `Player@123`** (or phone `9999999999`)

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite (5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Playwright |

## API client

`src/lib/apiClient.js` + `src/api/*` — auth token in `localStorage` (`player_token`).
