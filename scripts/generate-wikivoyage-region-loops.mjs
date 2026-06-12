// Generate 5 Seedance video loops, one per continent grouping for /wikivoyage.
// Uploads to s3://com27/wsl/regions/<continent>.mp4 (5s, 864x480 MP4).
//
// Usage:
//   npm run gen:region-loops                  # generate all 5
//   npm run gen:region-loops -- --skip-existing
//
// Env: RUNWARE_API_KEY, S3_ACCESS_KEY, S3_SECRET_ACCESS_KEY

import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import os from "node:os";
import crypto from "node:crypto";

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
    if (fs.existsSync(f)) Object.assign(merged, parseEnv(fs.readFileSync(f, "utf8")));
  }
  if (!merged.RUNWARE_API_KEY) throw new Error("RUNWARE_API_KEY not found");
  if (!merged.S3_ACCESS_KEY || !merged.S3_SECRET_ACCESS_KEY) throw new Error("S3 keys not found");
  return merged;
}

const ENV = loadEnv();
const RUNWARE_API_KEY = ENV.RUNWARE_API_KEY;
const S3_BUCKET = (ENV.S3_BUCKET_NAME || "com27").trim();
const S3_REGION = (ENV.S3_REGION || "eu-west-2").trim();
const S3_PREFIX = "wsl/regions";

const SKIP_EXISTING = process.argv.includes("--skip-existing");

const CONTINENT_LOOPS = [
  {
    id: "africa",
    prompt:
      "Slow cinematic aerial pan over an African savanna at golden hour, " +
      "acacia trees silhouetted against orange sky, distant baobab, " +
      "5 seconds, no people, no text, travel documentary style",
  },
  {
    id: "asia",
    prompt:
      "Slow cinematic aerial pan over an Asian temple complex at sunrise, " +
      "mist rising over tropical mountains, pagoda silhouettes, " +
      "5 seconds, no people, no text, travel documentary style",
  },
  {
    id: "europe",
    prompt:
      "Slow cinematic aerial pan over a European medieval cityscape at dusk, " +
      "terracotta rooftops, gothic spires, river reflection, " +
      "5 seconds, no people, no text, travel documentary style",
  },
  {
    id: "americas",
    prompt:
      "Slow cinematic aerial pan over Andean mountains and Amazon rainforest, " +
      "snow-capped peaks transitioning to dense jungle, golden hour, " +
      "5 seconds, no people, no text, travel documentary style",
  },
  {
    id: "oceania",
    prompt:
      "Slow cinematic aerial pan over a Pacific coral reef and turquoise lagoon, " +
      "white sand atoll, palm trees, crystal clear water, " +
      "5 seconds, no people, no text, travel documentary style",
  },
];

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

// SigV4 PutObject (minimal)
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

// Runware Seedance video API
async function runwarePost(payload) {
  const res = await fetch("https://api.runware.ai/v1/", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${RUNWARE_API_KEY}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Runware ${res.status}: ${txt.slice(0, 300)}`);
  }
  return res.json();
}

async function runwareGenerateVideo(prompt) {
  const taskUUID = crypto.randomUUID();
  await runwarePost([{
    taskType: "videoInference",
    taskUUID,
    positivePrompt: prompt,
    model: "bytedance:2@2",   // Seedance (hard-pin per feedback_runware_default_model_is_video)
    width: 864,
    height: 480,
    duration: 5,
    numberResults: 1,
    outputFormat: "MP4",
    outputType: "URL",
  }]);

  for (let attempt = 0; attempt < 60; attempt++) {
    await sleep(5000);
    const json = await runwarePost([{ taskType: "getResponse", taskUUID }]);
    const item = json.data?.[0];
    if (!item) continue;
    if (item.errors?.length) throw new Error(`Runware error: ${JSON.stringify(item.errors).slice(0, 200)}`);
    if (item.status === "success" && item.videoURL) return item.videoURL;
    if (item.status === "failed") throw new Error(`Task failed: ${JSON.stringify(item).slice(0, 200)}`);
  }
  throw new Error("timeout after 5 minutes");
}

async function main() {
  console.log(`[loops] generating ${CONTINENT_LOOPS.length} continent video loops (Seedance bytedance:2@2)\n`);
  let generated = 0, skipped = 0, failed = 0;

  for (let i = 0; i < CONTINENT_LOOPS.length; i++) {
    const { id, prompt } = CONTINENT_LOOPS[i];
    const key = `${S3_PREFIX}/${id}.mp4`;
    const label = `[${i + 1}/${CONTINENT_LOOPS.length}] ${id}`;

    if (SKIP_EXISTING && (await s3Exists(key))) {
      console.log(`  ${label} — exists, skipping`);
      skipped++;
      continue;
    }

    try {
      process.stdout.write(`  ${label} — generating (5s 864x480)…`);
      const videoUrl = await runwareGenerateVideo(prompt);
      const buf = await downloadBuffer(videoUrl);
      const publicUrl = await s3Put(key, buf, "video/mp4");
      console.log(` ✓ ${(buf.length / 1024 / 1024).toFixed(2)}MB → ${publicUrl}`);
      generated++;
      await sleep(1000);
    } catch (err) {
      console.error(` ✗ ${err.message}`);
      failed++;
    }
  }

  console.log(`\n[loops] generated=${generated} skipped=${skipped} failed=${failed}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
