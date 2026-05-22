// Server-only Mongo client for WSL content reads.
// Returns null when MONGO_URI is unset so local dev / fallback paths keep working.
// Pattern mirrored from ~/APPS/yb100/src/lib/mongo.ts.

import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB ?? "AIDB";

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
