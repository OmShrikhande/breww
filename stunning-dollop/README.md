# Games Admin Dashboard (stunning-dollop)

**GameAdmin** — React admin panel for the games platform.

Talks to the **admin** API only:

`laughing-computing-machine` → `http://localhost:3000/api`  
(On deploy: `https://YOUR-HOST/api`)

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

React 19, Vite 7, React Router 7, React Hook Form + Yup, Framer Motion. Deploy: Netlify.

## Setup

```bash
# 1) Backend (admin + player in one process)
cd path/to/laughing-computing-machine
npm install && npm run dev   # :3000

# 2) This UI
cd path/to/stunning-dollop
npm install && npm run dev   # :5173 — proxies /api → :3000
```

Login: **`admin@gmail.com` / `admin123`**

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite |
| `npm run build` | Production build |
| `npm run preview` | Preview build |
| `npm run lint` | ESLint |

## Docs

See `API_SPEC.md` and `laughing-computing-machine/api_specs.md`.
