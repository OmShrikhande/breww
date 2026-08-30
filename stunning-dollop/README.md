# Games Admin Dashboard (stunning-dollop)

**GameAdmin** — React admin panel for the games platform.

Talks to the **admin** API only:

`laughing-computing-machine` → `http://localhost:3000/api`  
(Production: `https://breww-ysqj.onrender.com/api` or your deployed backend)

| Project | Role |
|---------|------|
| **stunning-dollop** (this) | Admin UI |
| `laughing-computing-machine` | Combined backend (admin `/api` + player `/player/api`) |
| `breeww` | Player UI → `/player/api` |

## Features

- JWT login (Admin / Super Admin / Viewer roles)
- Dashboard, games, live rounds, users, analytics, settings, notifications
- Role-aware writes (viewer = read-only; security/payments/API key = superadmin)

## Tech

React 19, Vite 7, React Router 7, React Hook Form + Yup, Framer Motion.

## Local setup

```bash
# 1) Backend (admin + player in one process)
cd path/to/laughing-computing-machine
npm install && npm run dev   # :3000

# 2) This UI
cd path/to/stunning-dollop
npm install && npm run dev   # :5174 — proxies /api → :3000
```

Login: **`admin@gmail.com` / `admin123`**

## Deploy on Vercel

This app is a static Vite SPA. API calls use relative `/api/*` paths, proxied to the Render backend via `vercel.json`.

### 1. Import the repo

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the `game-development` repository
3. Set **Root Directory** to `stunning-dollop`
4. Framework Preset: **Vite** (auto-detected from `vercel.json`)

### 2. Build settings (defaults)

| Setting | Value |
|---------|--------|
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### 3. Environment variables (optional)

Usually **not required** — `vercel.json` rewrites `/api` to the Render backend.

Set only if you use a different backend URL **without** editing `vercel.json`:

| Variable | Example |
|----------|---------|
| `VITE_API_BASE_URL` | `https://your-backend.onrender.com` |

Do **not** include `/api` in the value (endpoints already start with `/api`).

### 4. Backend CORS

`laughing-computing-machine` allows all `*.vercel.app` origins automatically. No extra CORS config needed for Vercel previews/production.

### 5. Custom backend URL

Update the rewrite destination in `vercel.json`:

```json
{
  "source": "/api/:path*",
  "destination": "https://YOUR-BACKEND.onrender.com/api/:path*"
}
```

Or set `VITE_API_BASE_URL` in Vercel and remove/ignore the rewrite.

### 6. Deploy via CLI

```bash
cd stunning-dollop
npx vercel
npx vercel --prod
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server (:5174) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

## Docs

See `API_SPEC.md` and `laughing-computing-machine/api_specs.md`.
