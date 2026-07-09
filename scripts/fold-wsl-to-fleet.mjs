#!/usr/bin/env node
/**
 * fold-wsl-to-fleet.mjs — thin wrapper documenting the 14 (+2 time-series)
 * cockpit `mongo-fold.mjs` invocations that migrate wsl legacy `AIDB.wsl_*`
 * collections into shared FLEET collections with `{app:'wsl', kind}`.
 *
 * DRY-RUN by default: prints the commands to run, does NOT execute against
 * production. Copy/paste (or pipe through `sh`) to actually run each fold.
 * The cockpit `mongo-fold.mjs` is idempotent — re-runs skip already-folded
 * rows via the `_fold_source`/`_legacy_id` upsert filter.
 *
 * Usage:
 *   node scripts/fold-wsl-to-fleet.mjs              # print commands
 *   node scripts/fold-wsl-to-fleet.mjs | grep node  # filter
 *
 * IMPORTANT — slug namespacing:
 *   FLEET.items has `{app, slug}` unique. wsl folds four different kinds
 *   (`city`, `country`, `hotel`) into the same collection, so their slugs
 *   MUST be prefixed at fold time to avoid collisions (e.g. wsl_cities.id
 *   'london' and a future wsl_hotels row named 'london' would clash).
 *   Because `mongo-fold.mjs` copies source docs verbatim into FLEET (only
 *   adding {app, kind, category}), the slug rewrite has to happen either:
 *     (a) as a follow-up updateMany after the fold (documented below), OR
 *     (b) via the wsl seeder (scripts/seed-mongo.ts) which writes namespaced
 *         slugs directly and bypasses mongo-fold for the static-seed kinds.
 *
 *   For wsl the preferred path is (b): the static seed lives in
 *   src/lib/wsl-v2/seed.ts, so running `pnpm tsx scripts/seed-mongo.ts`
 *   populates FLEET with the correct namespaced slugs. mongo-fold.mjs is
 *   only needed to preserve *historical* AIDB.wsl_news / wsl_tickers /
 *   wsl_currencies / wsl_flights / wsl_climate ingest rows that were written
 *   before this migration. For those, the update-slug step is included as
 *   a comment after each fold command.
 *
 *   Same reasoning applies to `scroller` → FLEET.media (uses `s3_key`,
 *   namespaced `scroller-*`) and `videos` → FLEET.videos (slug namespaced
 *   `video-*`).
 *
 * Post-fold verification:
 *   node ~/APPS/appai/scripts/mongo-drift.mjs
 *   mongosh --eval "db.getSiblingDB('FLEET').items.countDocuments({app:'wsl'})"
 *   mongosh --eval "db.getSiblingDB('FLEET').lists.countDocuments({app:'wsl'})"
 *
 * Post-fold DROP (only after 7-day clean-read soak, user runs manually):
 *   for c in wsl_cities wsl_countries wsl_hotels wsl_top_visited \
 *            wsl_fastest_growing wsl_largest_gdp wsl_currencies wsl_gear \
 *            wsl_facts wsl_tickers wsl_news wsl_trending wsl_videos \
 *            wsl_scroller wsl_flights wsl_climate; do
 *     mongosh --eval "db.getSiblingDB('AIDB').$c.drop()"
 *   done
 */

const FOLDS = [
  // Collection remap per ~/.claude/plans/eager-sprouting-hammock.md B3.
  { src: "AIDB.wsl_cities",           dest: "items",  kind: "city"            },
  { src: "AIDB.wsl_countries",        dest: "items",  kind: "country"         },
  { src: "AIDB.wsl_hotels",           dest: "items",  kind: "hotel"           },
  { src: "AIDB.wsl_top_visited",      dest: "lists",  kind: "top-visited"     },
  { src: "AIDB.wsl_fastest_growing",  dest: "lists",  kind: "fastest-growing" },
  { src: "AIDB.wsl_largest_gdp",      dest: "lists",  kind: "largest-gdp"     },
  { src: "AIDB.wsl_currencies",       dest: "lists",  kind: "currency"        },
  { src: "AIDB.wsl_gear",             dest: "lists",  kind: "gear"            },
  { src: "AIDB.wsl_facts",            dest: "lists",  kind: "fact"            },
  { src: "AIDB.wsl_tickers",          dest: "lists",  kind: "ticker"          },
  { src: "AIDB.wsl_news",             dest: "lists",  kind: "news"            },
  { src: "AIDB.wsl_trending",         dest: "lists",  kind: "trending"        },
  { src: "AIDB.wsl_videos",           dest: "videos", kind: null              },
  { src: "AIDB.wsl_scroller",         dest: "media",  kind: "scroller"        },
  // Extra time-series collections written by /api/cron/ingest before the
  // migration. Not in the plan's 14-collection remap but need folding too
  // so no historical rows are lost.
  { src: "AIDB.wsl_flights",          dest: "lists",  kind: "flights"         },
  { src: "AIDB.wsl_climate",          dest: "lists",  kind: "climate"         },
];

const CONFIRM = process.argv.includes("--confirm");
const SCRIPT = "~/APPS/appai/scripts/mongo-fold.mjs";

console.log(`# fold-wsl-to-fleet.mjs — ${FOLDS.length} fold commands`);
console.log(`# App discriminator: --app wsl`);
console.log(
  `# Mode: ${CONFIRM ? "PRINT WITH --confirm (still not executed)" : "DRY-RUN preview"}\n`,
);

for (const f of FOLDS) {
  const parts = [
    "node",
    SCRIPT,
    f.src,
    f.dest,
    "--app wsl",
  ];
  if (f.kind) parts.push(`--kind ${f.kind}`);
  if (CONFIRM) parts.push("--confirm");
  console.log(parts.join(" "));
}

console.log(`\n# ---- Post-fold slug namespacing (only needed for historical`);
console.log(`# ---- AIDB rows; the wsl seeder writes namespaced slugs directly).`);
console.log(`# Prefix each kind's slug with '<kind>-' so {app, slug} stays unique.`);
console.log(`# Example (run once per kind after all folds land, in mongosh):`);
console.log(`#   use FLEET`);
console.log(`#   db.items.find({app:'wsl', kind:'city', slug: {$not:/^city-/}}).forEach(d =>`);
console.log(`#     db.items.updateOne({_id:d._id}, {$set:{slug: 'city-' + (d.slug || d.id)}}));`);
console.log(`# Repeat for kinds: country, hotel (items); top-visited, fastest-growing,`);
console.log(`# largest-gdp, currency, gear, fact, ticker, news, trending (lists);`);
console.log(`# scroller (media, s3_key); video (videos, slug).\n`);

if (!CONFIRM) {
  console.log(`# Preview complete. To generate the same commands with --confirm on`);
  console.log(`# each fold: node scripts/fold-wsl-to-fleet.mjs --confirm`);
  console.log(`# (Still just prints — pipe to \`sh\` when you're ready.)`);
}
