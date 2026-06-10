# WSL — World Stats Live

Next.js 15 app · v2 "World Stats Live" dashboard · port **19011** · accent #10b981.

Repo: https://github.com/flexappdev/wsl · Vercel deploy at root path.

## v2 routes

- `/` — Dashboard (live tickers, world map, top-country lists, currency strip)
- `/population` — country rankings + UN curve 1700→2100
- `/gdp` — live GDP pulse, top economies, regional shares, currency table, news
- `/climate` — emissions tickers, top emitters, renewables leaders, CO₂ milestones
- `/tourism` — tourism spend, top-visited + fastest-growing, busiest airports
- `/destinations` — featured country card + 11-country grid + trending searches
- `/story` — long-form scroller (5 chapters on the population curve)
- `/about` — 12 cited sources, stack, methodology, FAQ
- `/random` — random fact / globe spin
- `/wikivoyage` — country travel guide index (81 countries by region, Wikivoyage-powered)
- `/wikivoyage/[slug]` — individual country travel guide with hero image + extract (81 SSG pages)
- `/bo` — Supabase-gated admin (Mongo health, collection browser, site-data viewer, wikivoyage stats)
- `/login`, `/auth/callback`, `/auth/error` — auth flow

## SEO / discoverability

- Per-route `metadata` exports with OG titles + descriptions
- `/robots.txt` and `/sitemap.xml` auto-generated (see `src/app/robots.ts` + `src/app/sitemap.ts`)
- Custom `not-found.tsx` + `error.tsx` matching the WSL shell

## Data

- MongoDB read-only via `MONGO_URI` + `MONGO_DB` (defaults to `AIDB`) — see `src/lib/mongo.ts`
- Static seed at `src/lib/wsl-v2/seed.ts` (ported from `ux/wsl-v2/src/data.js`) — keeps the site green when Mongo is unset
- Seed → Mongo: `npm run seed:mongo` (writes 14 `wsl_*` collections; `seed:mongo:dry` previews)
- Wikivoyage snapshot: `npm run ingest:wikivoyage` — bulk-fetches 198 countries from the Wikivoyage API, writes to `public/data/wikivoyage-countries.json` (81 countries with extracts, shipped with the build); `ingest:wikivoyage:refresh` bypasses disk cache

## Env

Copy `.env.example` → `.env.local` and fill in:
- `MONGO_URI`, `MONGO_DB`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (used by sitemap/robots/OG — defaults to `https://worldstats.live`)

Dev auth bypass: `document.cookie = "wsl-dev-bypass=1; path=/"` to reach `/bo` without login (development only).

## Legacy

- v2 design source-of-truth lives in [`ux/wsl-v2/`](./ux/wsl-v2) (Babel-CDN prototype, ported to TSX under `src/`)
- Original 2022 codebase preserved in [`2022/`](./2022)
- v1 public routes (`/countries`, `/scroller`, `/apps`, `/videos`, `/github`, `/prompts`) still exist but are no longer linked from the v2 shell
