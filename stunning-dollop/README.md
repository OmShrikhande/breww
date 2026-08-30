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

The admin UI calls the **Render backend directly** (`https://breww-ysqj.onrender.com/api/...`).  
Do **not** use Vercel `/api` rewrites — they cause `DEPLOYMENT_NOT_FOUND` on login.

### 1. Import the repo

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the `game-development` repository
3. Set **Root Directory** to `stunning-dollop`
4. Framework Preset: **Vite**

### 2. Environment variables

**Leave `VITE_API_BASE_URL` unset** unless you use a different backend.

| Variable | Value |
|----------|--------|
| *(none required)* | Production build defaults to `https://breww-ysqj.onrender.com` |

If you previously set `VITE_API_BASE_URL` to a `*.vercel.app` URL, **delete it** and redeploy.

### 3. Redeploy

After changing env vars: **Deployments → ⋯ → Redeploy** (must rebuild for Vite env to apply).

### 4. Backend CORS

`laughing-computing-machine` on Render allows all `*.vercel.app` origins automatically.

### 5. Custom backend URL

Set in Vercel → Settings → Environment Variables:

```
VITE_API_BASE_URL=https://YOUR-BACKEND.onrender.com
```

No trailing slash, no `/api` suffix.

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
