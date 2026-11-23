# SalonHub Admin Dashboard

Dedicated administration workspace for the SalonHub platform. This repository is intentionally separate from the customer and salon-owner frontend.

**Version 1.0.0 is live:** https://salonhub-admin-three.vercel.app

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide icons
- Responsive design tokens and accessible components

## Modules

- Administrator sign-in (`/login`), checked by the backend on every page
- Overview, analytics and activity
- Salons and salon details
- Users and person details
- Subscriptions
- Reports
- Administrator profile

## How it talks to the API

The browser never calls the backend directly. Pages call this app's own `/api/admin/*` route handlers, and those call the backend at `BACKEND_API_URL` on the server. The administrator session is an httpOnly cookie set by this app, so the backend needs no CORS entry for the dashboard.

## Local setup

```bash
npm ci
copy .env.example .env.local
npm run dev
```

`.env.local` sets `BACKEND_API_URL=http://127.0.0.1:8081`, the backend's local port.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run lint` | ESLint with no warnings allowed |
| `npm run typecheck` | TypeScript check |
| `npm run build` | Production build |
| `npm run check` | Lint, type check and build |

GitHub Actions runs lint, type check and build on every push.

## Production

The dashboard runs on Vercel (project `salonhub-admin`). Every push to `main` deploys automatically. The only setting is `BACKEND_API_URL=https://salon-hub-backend.onrender.com`.

To sign in, an account needs the administrator role (`role = 2` in the `user` table).

## Related repositories

- Backend: [Salon-hub-backend](https://github.com/ghalebshhab/Salon-hub-backend)
- Website: [Salon-hub-frontend](https://github.com/ghalebshhab/Salon-hub-frontend), live at https://salon-community-frontend.vercel.app

Version 1.0.0 was released on 23 November 2026. Each release is a Git tag (`v1.0.0`) with a GitHub release.
