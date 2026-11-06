# SalonHub Admin Dashboard

Dedicated administration workspace for the SalonHub platform. This repository is intentionally separate from the customer and salon-owner frontend.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide icons
- Responsive design tokens and accessible components

## Local setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

`NEXT_PUBLIC_API_BASE_URL` points to `http://localhost:8081/api` locally. The API client and endpoint integration will be added after the v0 interface is approved.

## Planned modules

- Secure administrator authentication
- Platform overview and operational statistics
- Salon approval, rejection, resubmission, blocking, and restoration
- User administration and account blocking
- Platform activity, moderation, audit history, and reports

The v0-generated interface will be reviewed before backend endpoints are connected.
