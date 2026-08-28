# Player API (`backend/`)

Player-facing REST API for **Breeww**.

## How it runs

| Mode | How | Base URL |
|------|-----|----------|
| **Combined deploy (default)** | Mounted by root `index.js` at `/player` | `https://HOST/player/api` |
| **Standalone** | `npm run dev` in this folder | `http://localhost:3001/api` |

When the repo is deployed once with `npm start`, this API is included — **no second service / redeploy**.

Env is loaded from **this folder’s `.env`** without overwriting the admin process env. You can also set `PLAYER_DATABASE_URL`, `PLAYER_JWT_SECRET`, etc. on the host.

## Setup (standalone)

```bash
cp .env.example .env
npm install
npm run dev
```

## Endpoints (relative to `/api` or `/player/api`)

| Method | Path | Auth |
|--------|------|------|
| POST | `/auth/register` | no |
| POST | `/auth/login` | no |
| GET | `/auth/me` | Bearer |
| POST | `/auth/logout` | Bearer |
| GET | `/wallet/balance` | Bearer |
| GET | `/wallet/ledger` | Bearer |
| POST | `/wallet/adjust` | Bearer |
| POST | `/games/bet` | Bearer |
| GET | `/games/history` | Bearer |
| POST | `/roulette/bet` | optional |
| GET | `/user/profile` | Bearer |
| GET | `/health` | no |

Demo user: `player@breeww.com` / `Player@123` (phone `9999999999`).

## Engine

If `ENGINE_API_BASE_URL` + `ENGINE_INTERNAL_API_KEY` are set, bets/roulette try the engine first; otherwise local settlement is used.
