# 🎮 Breeww Gaming Platform — Comprehensive Games Audit & TODO Roadmap

> **Audit Date:** August 31, 2026  
> **Status:** Production-Ready Core Architecture with Full Live Multiplayer/Singleplayer Games

---

## 📊 1. Games Connectivity & Functionality Matrix

| # | Game Name | Player Frontend (`breeww`) | Admin Dashboard (`stunning-dollop`) | Backend API & DB (`laughing-computing-machine`) | Engine Type | Auth & Guest Guard | Real Wallet Deduct / Payout | Overall Status |
|---|---|:---:|:---:|:---:|---|:---:|:---:|---|
| **1** | **Aviator** | ✅ Live (`/game/aviator`) | ✅ Full Controls & Analytics | ✅ `/player/api/aviator/*` + DB | Live Multiplier Crash | ✅ Redirects `/login` | ✅ Live Real Ledger | 🟢 **100% Functional & Verified** |
| **2** | **Color Prediction** | ✅ Live (`/game/color-prediction`) | ✅ Full Controls (RTP, Multipliers, Auto/Manual) | ✅ `/player/api/games/round/colour/*` + DB | Round-Driven (30s/60s) | ✅ Redirects `/login` | ✅ Live Real Ledger | 🟢 **100% Functional & Verified** |
| **3** | **Andar Bahar** | ✅ Live (`/game/andar-bahar`) | ✅ Full Controls (`andar-bahar`) | ✅ `/player/api/games/round/andar-bahar/*` + DB | Round-Driven Card Game | ✅ Redirects `/login` | ✅ Live Real Ledger | 🟢 **100% Functional & Verified** |
| **4** | **Dice Roll** | ✅ Live (`/game/dice`) | ✅ Full Controls (`dice`) | ✅ `/player/api/games/round/dice/*` + DB | Round-Driven Multi-Bet | ✅ Redirects `/login` | ✅ Live Real Ledger | 🟢 **100% Functional & Verified** |
| **5** | **Dragon Tiger** | ✅ Live (`/game/dragon-tiger`) | ✅ Full Controls (`dragon-tiger`) | ✅ `/player/api/games/round/dragon-tiger/*` + DB | Round-Driven High Card | ✅ Redirects `/login` | ✅ Live Real Ledger | 🟢 **100% Functional & Verified** |
| **6** | **Mines** | ✅ Live (`/game/mines`) | ✅ Full Controls (`mines` RTP & grid) | ✅ `/player/api/mines/*` + Session DB | Singleplayer Active Session | ✅ Redirects `/login` | ✅ Live Real Ledger | 🟢 **100% Functional & Verified** |
| **7** | **Roulette** | ✅ Live (`/game/roulette`) | 🟡 In Platform DB; Needs Admin Grid Tile | ✅ `/player/api/games/roulette/bet` + DB | Instant / Local Table Settlement | ✅ Redirects `/login` | ✅ Live Real Ledger | 🟢 **100% Functional (Needs Admin Tile)** |
| **8** | **Spin Wheel** | ✅ Interactive UI (`/game/spin-wheel`) | ✅ Full Controls (`wheel`) | 🟡 Round Option Registered (`wheel`) | Client-Side Preview (Auth Guarded) | ✅ Redirects `/login` | 🟡 Preview Ledger | 🟡 **Needs Direct Backend API Hookup** |
| **9** | **Plinko** | ✅ Interactive Matter.js UI (`/game/plinko`) | ✅ Full Controls (`plinko`) | 🟡 Round Option Registered (`plinko`) | Physics Simulation (Auth Guarded) | ✅ Redirects `/login` | 🟡 Preview Ledger | 🟡 **Needs Direct Backend API Hookup** |
| **10** | **Chamber Risk** | ✅ Interactive Russian Roulette Engine (`/game/chamber-risk`) | 🟡 In Platform DB; Needs Admin Grid Tile | 🟡 Catalog Registered | Interactive Engine (Auth Guarded) | ✅ Redirects `/login` | 🟡 Preview Ledger | 🟡 **Needs Session Backend Hookup (like Mines)** |
| **11** | **Poker** | ✅ Interactive Table (`/game/poker`) | 🟡 In Platform DB; Needs Admin Grid Tile | 🟡 Catalog Registered | Table Simulation (Auth Guarded) | ✅ Redirects `/login` | 🟡 Simulated Table Stack | 🟡 **Needs Multiplayer WebSocket Table** |

---

## 🛠️ 2. Detailed Breakdown of Each Game

### 🟢 Fully Functional & Live-Connected Games (Tier 1)

#### 1. Aviator (`/game/aviator`)
* **Frontend:** Dynamic SVG curve with red jet animation, jet trail gradient, interactive manual & auto bet controls, recent winners, and flight history ribbon.
* **Backend:** Automated ticker in `roundEngine.js`, live multiplier formula `e^(0.048 * t)` for smooth pacing, `MIN_CRASH = 1.5x`, and real-time cashout API.
* **Admin:** Full crash point configuration, auto/manual outcome preview, and real-time round monitoring.

#### 2. Color Prediction (`/game/color-prediction`)
* **Frontend:** Parity/Sapre/Bcone 30s/60s tabs, red/green/violet color selector, 0–9 number selection, big/small bets, and recent draw ball ribbon.
* **Backend:** Live synchronized round engine with auto least-bet-wins logic or admin manual override.
* **Admin:** Complete RTP, house edge, multiplier override (2x red/green, 4.5x violet), and live bet distribution view.

#### 3. Andar Bahar (`/game/andar-bahar`)
* **Frontend:** Animated dealing table with Joker card reveal, side-by-side Andar and Bahar betting slots, live round countdown, and deal history.
* **Backend:** Round-driven settlement in `roundEngine.js`, deterministic card distribution.
* **Admin:** Controlled under `andar-bahar` game settings with deck and house edge configuration.

#### 4. Dice Roll (`/game/dice`)
* **Frontend:** Multi-select betting grid for numbers 1–18, Big/Small, Even/Odd, 3D animated dice shaker.
* **Backend:** Automated 3-dice settlement, payout calculation matching odds, wallet ledger updates.
* **Admin:** Configurable roll duration, house edge, and minimum/maximum stake limits.

#### 5. Dragon Tiger (`/game/dragon-tiger`)
* **Frontend:** Card comparison table, Dragon / Tiger / Tie betting zones, card flip animations.
* **Backend:** High-card evaluation engine, tie payout handling (8:1), live ledger entries.
* **Admin:** Dragon (1.95x), Tiger (1.95x), and Tie (8x) multiplier settings with deck count controls.

#### 6. Mines (`/game/mines`)
* **Frontend:** 5x5 grid with selectable mine count (1–24), sound effects, tile reveal animations, and live cashout calculation.
* **Backend:** Session-based persistent state in `mines_sessions` table, server-side secret mine placements to prevent client inspection, safe reveal validation, and cashout multiplier formula.
* **Admin:** Mine count bounds, default mines (3), and RTP / house edge configuration.

#### 7. European Roulette (`/game/roulette`)
* **Frontend:** Full European roulette cloth board with numbers 0–36, red/black, odd/even, dozens, columns, and animated 37-pocket roulette wheel.
* **Backend:** `POST /player/api/games/roulette/bet` endpoint validating multiple inside/outside bets, RNG pocket selection, payout computation, and wallet balance ledger updates.
* **Admin:** Registered in platform catalog and database.

---

### 🟡 Games to Hook Up with Dedicated Server Handlers (Tier 2 Roadmap)

#### 8. Spin Wheel (`/game/spin-wheel`)
* **Current State:** Beautiful SVG wheel with risk levels (Low, Medium, High) and multiplier segments. Protected by guest auth guard (`useAuth`).
* **TODO:**
  - [ ] Connect `WheelControls` to `/player/api/games/round/wheel/bet` instead of client-side preview `addBet`.
  - [ ] Support live round wheel ticker in `roundEngine.js` for synchronized multiplayer spins.

#### 9. Plinko (`/game/plinko`)
* **Current State:** High-performance Matter.js 2D physics engine, customizable rows (8–16) and risk levels (Low, Medium, High). Guest protected.
* **TODO:**
  - [ ] Create `/player/api/games/plinko/drop` endpoint returning server-verified peg path and payout multiplier.
  - [ ] Connect drop ball action directly to user balance ledger.

#### 10. Chamber Risk (`/game/chamber-risk`)
* **Current State:** 6-chamber cylinder survival ladder game with multiplier escalation, bullet sounds, and cashout celebration. Guest protected.
* **TODO:**
  - [ ] Create `chamber_sessions` table in PostgreSQL.
  - [ ] Implement session-based endpoints `/player/api/chamber/start`, `/reveal`, and `/cashout` (mirroring `mines.js` architecture).

#### 11. Poker (`/game/poker`)
* **Current State:** 6-seat Texas Hold'em table simulation with player cards, community flop/turn/river cards, chips stack, and call/raise/fold actions.
* **TODO:**
  - [ ] Implement WebSocket room server for real-time multiplayer Texas Hold'em or automated bot table.
  - [ ] Add blind deductions and pot winner distribution logic.

---

## 📋 3. Master TODO Checklist & Action Plan

### A. Games & Gameplay Engines
- [x] **Fix Aviator bet placing timer synchronization** (eliminated UTC clock offset bug).
- [x] **Optimize Aviator plane speed and pacing** (reduced multiplier growth rate to `0.048`, `MIN_CRASH = 1.5x`).
- [x] **Fix Aviator cashout response** (instant button activation upon flight, legitimate payout multiplier).
- [x] **Strict 10-Digit Mobile & Credential Validation** (enforced on both Frontend & Backend).
- [x] **Enforce Guest Protection across all 11 games** (unauthenticated players redirected to `/login`).
- [ ] Connect **Spin Wheel** frontend to `/player/api/games/round/wheel/bet`.
- [ ] Connect **Plinko** ball drop to dedicated backend instant game endpoint.
- [ ] Create backend session engine for **Chamber Risk** (`chamber_sessions` table).
- [ ] Implement WebSocket room architecture for **Poker**.

### B. Admin Dashboard (`stunning-dollop`)
- [x] Game management cards for Aviator, Colour, Mines, Spin Wheel, Dice, Dragon Tiger, Andar Bahar, and Plinko.
- [x] Live round auto/manual winner override controls.
- [x] User management, balance adjustments, and transaction logs.
- [ ] Add dedicated tiles for **Roulette**, **Chamber Risk**, and **Poker** to `GAMES_DATA` in Admin `gamesConfig.js`.
- [ ] Add real-time WebSocket connection to Admin Dashboard for instant live bet feeds.

### C. Wallet, Auth & Security
- [x] Case-insensitive email and 10-digit Indian phone authentication (`+91` normalization).
- [x] Password length constraints (6–32 chars) and confirm password matching.
- [x] Privacy agreement mandatory check.
- [x] Transaction ledger tracking for all game bets and cashout wins.
- [ ] Integrate payment gateway (UPI / Razorpay / PhonePe / Crypto) for automated deposits & withdrawals.
- [ ] Add OTP verification flow for phone-based logins and password resets.

---

*Document generated and audited for Breeww & stunning-dollop ecosystem.*
