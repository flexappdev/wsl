# WSL — World Stats Live

Next.js 15 app · v2 "World Stats Live" dashboard · port **19011** · accent #10b981.

Repo: https://github.com/flexappdev/wsl · GitHub Pages / Vercel deploy at root path.

## v2 routes

- `/` — Dashboard (live tickers, world map, top-country lists, currency strip)
- `/population`, `/gdp`, `/climate`, `/tourism`, `/destinations`, `/story`, `/about` — section pages (foundation stubs in this round)
- `/bo` — Supabase-gated admin (Mongo health, collection browser, sample doc viewer)
- `/login`, `/auth/callback`, `/auth/error` — auth flow

## Data

- MongoDB read-only via `MONGO_URI` + `MONGO_DB` (defaults to `AIDB`) — see `src/lib/mongo.ts`
- Static seed at `src/lib/wsl-v2/seed.ts` (ported from `ux/wsl-v2/src/data.js`) — keeps the site green when Mongo is unset

## Env

Copy `.env.example` → `.env.local` and fill in:
- `MONGO_URI`, `MONGO_DB`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Dev auth bypass: `document.cookie = "wsl-dev-bypass=1; path=/"` to reach `/bo` without login (development only).

## Legacy

- v2 design source-of-truth lives in [`ux/wsl-v2/`](./ux/wsl-v2) (Babel-CDN prototype, ported to TSX under `src/`)
- Original 2022 codebase preserved in [`2022/`](./2022)
- v1 public routes (`/countries`, `/scroller`, `/apps`, `/videos`, `/github`, `/prompts`) still exist but are no longer linked from the v2 shell
