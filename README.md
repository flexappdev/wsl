# WSL — World Stats Live

Next.js 15 app · v2 "World Stats Live" dashboard · port **19011** · accent #10b981.

Repo: https://github.com/flexappdev/wsl · Vercel deploy at root path.

## Routes — **481 prerendered pages**

### Dashboard + narrative

- `/` — Dashboard (live tickers, world map, top-country lists, currency strip)
- `/story` — long-form scroller (5 chapters on the population curve)
- `/about` — 12 cited sources, stack, methodology, FAQ
- `/random` — random fact / globe spin

### Topic hubs (13)

- `/population` — country rankings + UN curve 1700→2100
- `/gdp` — live GDP pulse, top economies, regional shares
- `/climate` — emissions tickers, top emitters, renewables, CO₂ milestones
- `/tourism` — tourism spend, top-visited, fastest-growing, busiest airports
- `/destinations` — featured country + 195-country grid + trending searches
- `/energy` — top producers, per-capita use, energy transition (EIA / BP / IEA)
- `/health` — life expectancy, healthcare spending per capita (WHO / OECD)
- `/education` — literacy, tertiary enrollment (UNESCO / OECD)
- `/migration` — refugee hosts, remittances (UNHCR / World Bank)
- `/technology` — internet penetration, mobile speed (ITU / Ookla)
- `/hunger` — undernourishment, food-security leaders (FAO / GFSI)
- `/conflict` — Global Peace Index, military spending (IEP / SIPRI)
- `/biodiversity` — species richness, endemic diversity (IUCN / WWF)

### Country drill-down (445 SSG pages)

- `/countries` — 250-country register (mledoze/countries dataset)
- `/countries/[cca3]` — **250 SSG country profiles** with JSON-LD `Country` schema, S3 hero image (when Wikivoyage cross-links), per-country rank against the population/GDP/emitter/tourism/renewables/airport tables, links to full travel guide
- `/wikivoyage` — country travel guide index (198 countries, 5 continent video loops, newsletter)
- `/wikivoyage/[slug]` — **198 SSG travel guides** with FLUX hero (1792×1024), JSON-LD `TouristDestination` schema, per-slug OG card, GA4 event

### Cross-cut

- `/compare?ids=USA,CHN,IND` — side-by-side comparison of up to 4 countries × 12 metrics
- `/map` — SVG world map with 198 Wikivoyage country dots (equirectangular projection) + 20 seed cities
- `/data` — 16 machine-readable datasets, CSV or JSON

### Machine-readable

- `/api/export?topic=<id>&format=csv|json` — 16 topics: countries, wikivoyage, top-populous, top-gdp, top-emitters, top-visited, top-fastest-growing, top-life-expectancy, top-renewables, top-military-spending, top-refugee-hosts, top-remittances, top-internet, top-literacy, top-species-richness, top-airports

### Admin

- `/bo` — Supabase-gated admin (Mongo health, collection browser, site-data, wikivoyage stats, 9 codebase diagrams)
- `/login`, `/auth/callback`, `/auth/error` — auth flow

## SEO / discoverability

- Per-route `metadata` exports with OG titles + descriptions
- `/robots.txt` and `/sitemap.xml` auto-generated (see `src/app/robots.ts` + `src/app/sitemap.ts`)
- Custom `not-found.tsx` + `error.tsx` matching the WSL shell

## Data

- MongoDB read-only via `MONGO_URI` + `MONGO_DB` (defaults to `AIDB`) — see `src/lib/mongo.ts`
- Static seed at `src/lib/wsl-v2/seed.ts` (ported from `ux/wsl-v2/src/data.js`) — keeps the site green when Mongo is unset
- Seed → Mongo: `npm run seed:mongo` (writes 14 `wsl_*` collections; `seed:mongo:dry` previews)

## Wikivoyage atlas pipeline

The `/wikivoyage` section is a 198-country travel atlas built from three sources and a media pipeline. Re-run any leg independently.

| Step | Script | Output |
|---|---|---|
| 1. Text ingest | `npm run ingest:wikivoyage` | `public/data/wikivoyage-countries.json` (245KB, 198 entries) |
| 2. FLUX heroes | `npm run gen:heroes` | `s3://com27/wsl/heroes/<slug>.jpg` × 198 (1792×1024) |
| 3. Seedance loops | `npm run gen:region-loops` | `s3://com27/wsl/regions/<continent>.mp4` × 5 (5s 864×480) |

**Step 1: text** — bulk-fetches every country in `SEED.allCountries` from the Wikivoyage MediaWiki API (50 titles/call). For the ~116 countries with empty Wikivoyage extracts (templates that don't survive `exintro=1`), falls back to the Wikipedia REST summary API. Each entry is tagged `source: "wikivoyage" | "wikipedia"` for transparency. Pages cache under `.cache/wikivoyage/` so re-runs are near-instant; use `npm run ingest:wikivoyage:refresh` to bypass.

**Step 2: heroes** — Runware FLUX (`runware:100@1`, hard-pinned per [[feedback_runware_default_model_is_video]]). 1792×1024 editorial landscape per country. Uploads via SigV4 PUT to `com27` bucket, region `eu-west-2`. Bucket policy needs a `PublicReadWsl` statement allowing `s3:GetObject` on `arn:aws:s3:::com27/wsl/*`. Run with `--limit=5` for smoke test, `--skip-existing` to backfill.

**Step 3: continent loops** — Runware Seedance (`bytedance:2@2`). 5 loops, one per continent (Africa, Asia, Europe, Americas, Oceania), mounted as `<video autoplay muted loop>` on the `/wikivoyage` index. ~5MB each.

**Env required:** `RUNWARE_API_KEY`, `S3_ACCESS_KEY`, `S3_SECRET_ACCESS_KEY` (read from `.env.local` then `~/context-2026/agents/.env`).

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
