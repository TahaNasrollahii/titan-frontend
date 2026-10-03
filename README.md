# Titan: frontend

Next.js 16 (App Router), React 19, RTL/Persian UI for the Titan gaming store and esports platform.
All data comes from the Django API in [`titan-back`](../titan-back).

## Getting started

```bash
cp .env.example .env.local      # NEXT_PUBLIC_API_URL, default http://localhost:8000/api/v1
npm install
npm run dev                     # http://localhost:3000
```

Start the backend first (see `titan-back/README.md`): `uv run python manage.py runserver`, after `seed`.

Log in as the demo player with mobile number `09123456789`. In development the backend prints the OTP code
to its console.

```bash
npm run build                   # production build (type-checks every route)
npm run lint
```

## How it talks to the API

| Piece | Where |
|---|---|
| HTTP client: JSON, Bearer token, automatic token refresh on 401, typed `ApiError` with the API's stable `code` | `src/lib/api/client.ts` |
| One typed function per endpoint | `src/lib/api/endpoints.ts` |
| Response types (camelCase, matching the API) | `src/lib/api/types.ts` |
| `useApi(fetcher, deps)`: loading/error/data/reload for page data | `src/lib/hooks/useApi.ts` |
| Number, price and Jalali date formatting, plus status labels | `src/lib/format.ts` |
| Session: login, logout, current user, presence heartbeat | `src/context/AuthContext.tsx` |
| Cart, toasts and the unread-notification badge | `src/context/AppContext.tsx` |

Notes:
- **Auth:** the OTP login at `/login` stores JWTs in `localStorage`. Pages that need a user are wrapped in
  `<RequireAuth>`, which redirects to `/login?next=…`; the whole dashboard route group is protected.
- **Cart:** guests get a browser cart. After login it is merged into the server cart (`cart/merge/`), and
  logged-in users always use the server cart.
- **Products, fixed price or options:**
  - `hasVariants: false`: show `price`.
  - `hasVariants: true`: list cards show "از …" ("from …"), and the product page shows an option picker.
    Each option has its own price, discount and stock, and the selected `variant` is sent to the cart.
- **Payments:** online payments redirect to the `paymentUrl` returned by the API. After the gateway, the
  browser lands on `/payment/result`.
- **Team invites:** links look like `/invite/<code>` and join the team after login.
- **Images:** the API returns absolute media URLs, so plain `<img>` is used rather than `next/image`.

## Routes

| Route | Data |
|---|---|
| `/` | `home/`: hero tournaments, game categories, your stats, announcements |
| `/store` | games (tabs), `products/` (filters, sort, pagination, wishlist), promos |
| `/product/[slug]` | product, options, reviews, related products |
| `/cart`, `/checkout`, `/payment/result` | cart, game accounts, wallet, checkout, payment status |
| `/tournament` | rank tiers, upcoming tournaments, leaderboards, your stats |
| `/tournaments`, `/tournaments/[slug]` | list with filters; details, registration, participants, bracket |
| `/tournaments/[slug]/bracket` | live bracket with your match and lobby code |
| `/dashboard?tab=…` | overview (wallet top-up), profile, game accounts, orders, wishlist, teams, tournaments, notifications |
| `/teams/create`, `/teams/[id]`, `/teams/[id]/manage`, `/invite/[code]` | teams |
| `/contact` | contact channels and support status |
| `/login` | OTP login / sign-up |
