// Generate FLUX hero images for every wikivoyage country entry.
// Reads public/data/wikivoyage-countries.json, generates a 1792x1024 landscape
// hero per country via Runware (model: runware:100@1 = FLUX Schnell), uploads
// to s3://com27/wsl/heroes/<slug>.jpg, and stamps s3_hero=true on the entry.
//
// Usage:
//   npm run gen:heroes -- --limit=5     # smoke test 5 countries
//   npm run gen:heroes                  # full (198)
//   npm run gen:heroes -- --skip-existing
//
// Env (reads .env.local first, then ~/context-2026/agents/.env):
//   RUNWARE_API_KEY
//   S3_ACCESS_KEY, S3_SECRET_ACCESS_KEY
//   (optional) S3_BUCKET_NAME (defaults com27), S3_REGION (defaults eu-west-2)

import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import os from "node:os";
import crypto from "node:crypto";

// ── Env loading ───────────────────────────────────────────────────────────────

function parseEnv(text) {
  const out = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

function loadEnv() {
  const sources = [
    new URL("../.env.local", import.meta.url).pathname,
    path.join(os.homedir(), "context-2026/agents/.env"),
  ];
  const merged = {};
  for (const f of sources) {
    if (fs.existsSync(f)) {
      Object.assign(merged, parseEnv(fs.readFileSync(f, "utf8")));
    }
  }
  if (!merged.RUNWARE_API_KEY) throw new Error("RUNWARE_API_KEY not found");
  if (!merged.S3_ACCESS_KEY || !merged.S3_SECRET_ACCESS_KEY) throw new Error("S3 keys not found");
  return merged;
}

const ENV = loadEnv();
const RUNWARE_API_KEY = ENV.RUNWARE_API_KEY;
const S3_BUCKET = (ENV.S3_BUCKET_NAME || "com27").trim();
const S3_REGION = (ENV.S3_REGION || "eu-west-2").trim();
const S3_PREFIX = "wsl/heroes";

// ── CLI args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const limitArg = args.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? parseInt(limitArg.split("=")[1], 10) : 0;
const SKIP_EXISTING = args.includes("--skip-existing");
const DRY_RUN = args.includes("--dry-run");

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

// ── SigV4 PutObject (minimal) ─────────────────────────────────────────────────

function hmac(key, data) { return crypto.createHmac("sha256", key).update(data).digest(); }
function sha256Hex(data) { return crypto.createHash("sha256").update(data).digest("hex"); }

function awsDate(d = new Date()) {
  const iso = d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return { amz: iso, ymd: iso.slice(0, 8) };
}

async function s3Put(key, body, contentType) {
  const { amz, ymd } = awsDate();
  const endpoint = `https://s3.${S3_REGION}.amazonaws.com`;
  const host = new URL(endpoint).host;
  const reqPath = `/${S3_BUCKET}/${encodeURI(key).replace(/'/g, "%27")}`;
  const payloadHash = sha256Hex(body);

  const canonicalHeaders =
    `content-type:${contentType}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amz}\n`;
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = ["PUT", reqPath, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const credentialScope = `${ymd}/${S3_REGION}/s3/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amz, credentialScope, sha256Hex(canonicalRequest)].join("\n");
  const kDate = hmac("AWS4" + ENV.S3_SECRET_ACCESS_KEY, ymd);
  const kRegion = hmac(kDate, S3_REGION);
  const kService = hmac(kRegion, "s3");
  const kSigning = hmac(kService, "aws4_request");
  const signature = hmac(kSigning, stringToSign).toString("hex");
  const auth = `AWS4-HMAC-SHA256 Credential=${ENV.S3_ACCESS_KEY}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(`${endpoint}${reqPath}`, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amz,
      Authorization: auth,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
    body,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`S3 PUT ${res.status}: ${txt.slice(0, 200)}`);
  }
  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
}

async function s3Exists(key) {
  const endpoint = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
  try {
    const r = await fetch(endpoint, { method: "HEAD" });
    return r.ok;
  } catch { return false; }
}

// ── Runware FLUX ──────────────────────────────────────────────────────────────

const RUNWARE_BASE = "https://api.runware.ai/v1";

async function runwareGenerate(prompt, retries = 3) {
  const body = JSON.stringify([{
    taskType: "imageInference",
    taskUUID: crypto.randomUUID(),
    positivePrompt: prompt,
    model: "runware:100@1",   // FLUX Schnell (hard-pinned per feedback_runware_default_model_is_video)
    width: 1792,
    height: 1024,
    numberResults: 1,
    outputFormat: "JPG",
  }]);

  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(`${RUNWARE_BASE}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RUNWARE_API_KEY}` },
      body,
    });
    if (!res.ok) {
      const txt = await res.text();
      if (attempt < retries && res.status >= 500) {
        console.warn(`  runware ${res.status} attempt ${attempt}, retrying…`);
        await sleep(2000 * attempt);
        continue;
      }
      throw new Error(`Runware ${res.status}: ${txt.slice(0, 200)}`);
    }
    const json = await res.json();
    const item = json.data?.[0];
    if (!item?.imageURL) throw new Error(`No imageURL: ${JSON.stringify(json).slice(0, 200)}`);
    return item.imageURL;
  }
}

// ── Prompt template ───────────────────────────────────────────────────────────

function heroPrompt(country) {
  return (
    `Editorial landscape photograph of ${country.title}, ${country.region}, ` +
    `golden hour, cinematic wide shot, dramatic sky, iconic scenery, ` +
    `no people, no text, no letters, travel magazine cover style, ` +
    `high resolution, professional photography, 16:9 widescreen`
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const dsPath = path.resolve(process.cwd(), "public/data/wikivoyage-countries.json");
  const ds = JSON.parse(fs.readFileSync(dsPath, "utf8"));
  const entries = LIMIT > 0 ? ds.entries.slice(0, LIMIT) : ds.entries;

  console.log(`[heroes] generating for ${entries.length} countries (skip-existing=${SKIP_EXISTING}, dry-run=${DRY_RUN})`);
  if (DRY_RUN) {
    for (const e of entries.slice(0, 5)) console.log(`  [dry] ${e.slug}: ${heroPrompt(e).slice(0, 100)}…`);
    return;
  }

  let generated = 0, skipped = 0, failed = 0;
  const stampedSlugs = new Set();

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const key = `${S3_PREFIX}/${e.slug}.jpg`;
    const label = `[${String(i + 1).padStart(3, "0")}/${entries.length}] ${e.flag} ${e.title}`;

    if (SKIP_EXISTING && (await s3Exists(key))) {
      console.log(`  ${label} — exists, skipping`);
      stampedSlugs.add(e.slug);
      skipped++;
      continue;
    }

    try {
      process.stdout.write(`  ${label} — generating…`);
      const imageUrl = await runwareGenerate(heroPrompt(e));
      const buf = await downloadBuffer(imageUrl);
      const publicUrl = await s3Put(key, buf, "image/jpeg");
      console.log(` ✓ ${(buf.length / 1024).toFixed(0)}KB → ${publicUrl}`);
      stampedSlugs.add(e.slug);
      generated++;
      await sleep(700);
    } catch (err) {
      console.error(` ✗ ${err.message}`);
      failed++;
    }
  }

  // Stamp s3_hero=true on dataset
  let updates = 0;
  for (const e of ds.entries) {
    if (stampedSlugs.has(e.slug) && !e.s3_hero) {
      e.s3_hero = true;
      updates++;
    }
  }
  ds.generatedAt = new Date().toISOString();
  fs.writeFileSync(dsPath, JSON.stringify(ds, null, 2));
  console.log(`\n[heroes] generated=${generated} skipped=${skipped} failed=${failed} stamped=${updates}`);
  console.log(`[heroes] public URL prefix: https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${S3_PREFIX}/`);
}

main().catch((err) => { console.error(err); process.exit(1); });
