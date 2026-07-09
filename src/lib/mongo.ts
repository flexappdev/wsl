// Server-only Mongo client for WSL content reads/writes.
// Returns null when MONGO_URI is unset so local dev / fallback paths keep working.
//
// FLEET migration (2026-07-09): the default DB is now the shared `FLEET` DB
// (see ~/APPS/appai/docs/MONGO-FLEET-SCHEMA.md). All wsl-owned docs carry
// `{app: 'wsl', kind: <string>}` and share collections with the other 12 sites.
// Slugs are namespaced by kind at fold time (city-*, country-*, hotel-*,
// top-visited-*, ...) so `{app, slug}` stays unique across the 14 folded kinds.
//
// The read fallback chain in dataSource.ts is unchanged — Mongo → static seed.
// Pattern mirrors ~/APPS/xmas/src/lib/fleet.ts.

import { MongoClient, type Collection, type Db, type Document } from "mongodb";

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB ?? "FLEET";

let cachedClient: MongoClient | null = null;
let cachedPromise: Promise<MongoClient> | null = null;

async function getClient(): Promise<MongoClient | null> {
  if (!uri) return null;
  if (cachedClient) return cachedClient;
  if (!cachedPromise) {
    cachedPromise = new MongoClient(uri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 3000,
    }).connect();
  }
  try {
    cachedClient = await cachedPromise;
    return cachedClient;
  } catch {
    cachedPromise = null;
    return null;
  }
}

export async function getMongoDb(): Promise<Db | null> {
  const client = await getClient();
  return client ? client.db(dbName) : null;
}

export function isMongoConfigured(): boolean {
  return Boolean(uri);
}

export function getMongoDbName(): string {
  return dbName;
}

// -----------------------------------------------------------------------------
// FLEET helpers — every wsl write MUST include {app: 'wsl'}.
// -----------------------------------------------------------------------------

export const APP = "wsl" as const;

// Filter helper: every wsl read on a FLEET collection MUST include {app:'wsl'}.
export const APP_FILTER = { app: APP } as const;

// Doc helper: every wsl write MUST include {app:'wsl'} so it can be scoped.
export function withApp<T extends Document>(doc: T): T & { app: typeof APP } {
  return { ...doc, app: APP };
}

// FLEET collection accessor. Returns null when Mongo is unset/unreachable so
// the seed fallback path keeps working locally.
export async function fleetCol<T extends Document = Document>(
  kind:
    | "items"
    | "lists"
    | "pages"
    | "media"
    | "media_jobs"
    | "videos"
    | "images"
    | "audio"
    | "runs"
    | "events"
    | "settings"
    | "social"
    | "daily_pick"
    | "feedback"
    | "wiki"
    | "taxonomy",
): Promise<Collection<T> | null> {
  const db = await getMongoDb();
  return db ? db.collection<T>(kind) : null;
}
