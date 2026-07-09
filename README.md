# WSL — World Stats Live

Next.js 15 app · **v3.0** "World Stats Live" dashboard · port **19011** · accent #10b981.

Repo: https://github.com/flexappdev/wsl · Vercel deploy at root path.

## V3 changelog (2026-07-08)

Ships V3.0–V3.4 in one pass — credibility fixes, live data layer, share/embed, and ArtefaiPass gate. Goal doc: [`docs/goal-2026-07-08.md`](docs/goal-2026-07-08.md).

- **V3.0 — kill seed mode.** Single `WSL_VERSION` in `src/lib/version.ts` drives header + footer (no more v2.0/v2.1 mismatch). Footer no longer leaks `(no MONGO_URI)` — just `data · live` / `data · seed`. New `/api/stats` (60s edge cache) + `/api/cron/ingest` (15-min Vercel cron via `vercel.json`) for FX (exchangerate.host), BTC/ETH (coingecko), CO₂ (NOAA Mauna Loa), and flights (OpenSky). Retries + stale-fallback baked in.
- **V3.1 — honest feeds.** `RightNowFeed` renders 6 deterministic items server-side (no more "Loading live feed…" flash) and continues client-side from `src/lib/feedEngine.ts`. Every event tagged `projection` in the UI. New `/api/news` route pulls Reuters/NOAA/UNWTO RSS with 30-min Mongo cache — real `pubDate` timestamps only, entire block hides on empty (no fake `Reuters · 2m ago`).
- **V3.2 — country pages.** `/countries/[cca3]` was already SSG for all 250 restcountries entries — kept as-is; sitemap already includes them.
- **V3.3 — share + embed.** Parameterised `/api/og?type=…&slug=…` (edge, next/og), copy-paste `/embed/population` widget, `ShareButton` component (Web Share API + clipboard fallback + embed-code copy). `X-Frame-Options: DENY` site-wide; `ALLOWALL` on `/embed/*` only.
- **V3.4 — ArtefaiPass hook.** `src/lib/entitlements.ts` reads the shared network `entitlements` table via existing Supabase client. `PassGate` (blur + upsell), `ExportCSV` (Pro-only, falls back to checkout URL for anons) wired into `/compare`.

New env vars (optional — all degrade gracefully):
- `MONGO_URI` / `MONGO_DB` — enables live ingest + news cache
- `CRON_SECRET` — bearer auth for `/api/cron/ingest`
- `NEXT_PUBLIC_PASS_CHECKOUT_URL` — override the ArtefaiPass checkout link (default `https://artefai.com/pass`)

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

- MongoDB read/write via `MONGO_URI` + `MONGO_DB` (defaults to **`FLEET`** post-migration) — see `src/lib/mongo.ts`
- Static seed at `src/lib/wsl-v2/seed.ts` (ported from `ux/wsl-v2/src/data.js`) — keeps the site green when Mongo is unset
- Seed → FLEET: `npm run seed:mongo` (writes ~130 wsl-scoped docs into shared FLEET collections; `seed:mongo:dry` previews)

### Mongo (FLEET)

Post-2026-07-09 migration: the 14 legacy `wsl_*` collections in `AIDB` (plus 2 time-series
tables `wsl_flights` / `wsl_climate` written by `/api/cron/ingest`) have been consolidated
into shared FLEET collections with an `{app:'wsl', kind}` discriminator. See
`~/APPS/appai/docs/MONGO-FLEET-SCHEMA.md` for the canonical schema.

**Collection remap:**

| Legacy (AIDB)          | FLEET collection | kind              |
|------------------------|------------------|-------------------|
| `wsl_cities`           | `items`          | `city`            |
| `wsl_countries`        | `items`          | `country`         |
| `wsl_hotels`           | `items`          | `hotel`           |
| `wsl_top_visited`      | `lists`          | `top-visited`     |
| `wsl_fastest_growing`  | `lists`          | `fastest-growing` |
| `wsl_largest_gdp`      | `lists`          | `largest-gdp`     |
| `wsl_currencies`       | `lists`          | `currency`        |
| `wsl_gear`             | `lists`          | `gear`            |
| `wsl_facts`            | `lists`          | `fact`            |
| `wsl_tickers`          | `lists`          | `ticker`          |
| `wsl_news`             | `lists`          | `news`            |
| `wsl_trending`         | `lists`          | `trending`        |
| `wsl_videos`           | `videos`         | *(none)*          |
| `wsl_scroller`         | `media`          | `scroller`        |
| `wsl_flights`          | `lists`          | `flights`         |
| `wsl_climate`          | `lists`          | `climate`         |

**Every wsl read on a FLEET collection MUST include `{app:'wsl'}`** — see the `APP_FILTER`
export and `readSection()` helper in `src/lib/wsl-v2/dataSource.ts`. Live ingest writes
(`/api/cron/ingest`) target `FLEET.lists` with `{app:'wsl', kind}` so nothing drifts
back into `AIDB`.

**Slug namespacing.** `FLEET.items` and `FLEET.lists` both enforce `{app, slug}` unique.
wsl folds 3 kinds into `items` (city / country / hotel) and 10 kinds into `lists`, so
slugs are prefixed with the kind at seed/fold time to avoid cross-kind collisions:

- items: `city-london`, `country-morocco`, `hotel-<countryId>-<city>-<name>`
- lists: `top-visited-france`, `fastest-growing-saudi-arabia`, `ticker-population`, `currency-eur-usd`, `fact-001`, `news-<pubDate>-<title>`, `trending-<query>`, `gear-<name>`
- videos: `video-<title-slug>`
- media (scroller): `s3_key = scroller-<eye-slug>` (synthetic — chapters aren't S3 media)

Rationale: safer than a pre-fold collision audit (both wsl_cities.london and a
hypothetical hotel named "London" would clash otherwise; namespacing sidesteps the
issue and stays readable).

**Fold script** (dry-run wrapper for `~/APPS/appai/scripts/mongo-fold.mjs` — see the file
header for the full 16-fold command list, slug rewrite recipe, and drop-legacy playbook):

```
node scripts/fold-wsl-to-fleet.mjs              # print all 16 fold commands
node scripts/fold-wsl-to-fleet.mjs --confirm    # print with --confirm on each (still dry — pipe to sh to run)
```

Static-seed kinds (everything except the ingest time-series) are populated directly by
`scripts/seed-mongo.ts` with the correct namespaced slugs — `mongo-fold.mjs` is only
needed to preserve *historical* AIDB.wsl_news / wsl_tickers / wsl_currencies /
wsl_flights / wsl_climate rows.

**7-day soak flow:**

1. Deploy the FLEET-aware code (this commit) and run `npm run seed:mongo` once to
   populate `FLEET.{items,lists,videos,media}` with the ~130 wsl-scoped seed docs.
2. Verify reads: home / `/countries/*` / `/tourism` / `/gdp` should all render live
   data (footer shows `data · live`). Cron ingest keeps `FLEET.lists` fresh for
   currency / ticker / flights / climate every 15 min.
3. Optional: run `node scripts/fold-wsl-to-fleet.mjs --confirm | sh` to backfill
   historical ingest rows from `AIDB.wsl_*`.
4. Watch `~/APPS/appai/scripts/mongo-drift.mjs` for 7 days — zero writes should hit
   `AIDB.wsl_*`.
5. User drops the 16 legacy `AIDB.wsl_*` collections manually in Atlas (or via the
   drop-loop in `scripts/fold-wsl-to-fleet.mjs` — commented, must be run explicitly).

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
