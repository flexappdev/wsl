// Newsletter sign-up: store first, then forward to the email provider.
//
// Before Nov 2026 the route answered `ok: true` (provider "echo") when no
// LOOPS_API_KEY / RESEND_* was set, so visitors saw "Subscribed" and the
// address was thrown away. Now a sign-up only succeeds when it has been
// written to Mongo (FLEET.newsletter_signups) or accepted by Loops/Resend.
// If neither works the caller gets ok:false and the route returns 503.

import type { Db } from "mongodb";
import { getMongoDb } from "@/lib/mongo";

export const NEWSLETTER_APP = "wsl";
export const SIGNUPS_COLLECTION = "newsletter_signups";
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ProviderName = "loops" | "resend";

export interface SignupResult {
  ok: boolean;
  stored: boolean;
  provider: ProviderName | null;
}

export interface SignupDeps {
  getDb?: () => Promise<Db | null>;
  fetchImpl?: typeof fetch;
  env?: Record<string, string | undefined>;
}

/** FLEET db or null. Never throws. */
export async function getSignupsDb(): Promise<Db | null> {
  try {
    return await getMongoDb();
  } catch (err) {
    console.error("[newsletter] mongo unavailable:", (err as Error)?.message);
    return null;
  }
}

async function storeSignup(
  getDb: () => Promise<Db | null>,
  email: string,
  source: string,
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    const now = new Date();
    await db.collection(SIGNUPS_COLLECTION).updateOne(
      { app: NEWSLETTER_APP, email },
      {
        $setOnInsert: { app: NEWSLETTER_APP, email, createdAt: now, firstSource: source },
        $set: { source, updatedAt: now, unsubscribed: false },
      },
      { upsert: true },
    );
    return true;
  } catch (err) {
    console.error("[newsletter] mongo write failed:", (err as Error)?.message);
    return false;
  }
}

async function markSynced(
  getDb: () => Promise<Db | null>,
  email: string,
  provider: ProviderName,
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    await db
      .collection(SIGNUPS_COLLECTION)
      .updateOne({ app: NEWSLETTER_APP, email }, { $set: { syncedTo: provider, syncedAt: new Date() } });
  } catch {
    // Non-fatal: the address is stored, it just shows as unsynced.
  }
}

async function forwardToProvider(
  fetchImpl: typeof fetch,
  env: Record<string, string | undefined>,
  email: string,
  source: string,
): Promise<ProviderName | null> {
  const loopsKey = env.LOOPS_API_KEY;
  const resendKey = env.RESEND_API_KEY;
  const audience = env.RESEND_AUDIENCE_ID;

  if (loopsKey) {
    try {
      const r = await fetchImpl("https://app.loops.so/api/v1/contacts/create", {
        method: "POST",
        headers: { authorization: `Bearer ${loopsKey}`, "content-type": "application/json" },
        body: JSON.stringify({ email, source, subscribed: true, userGroup: NEWSLETTER_APP }),
      });
      // 409 = contact already exists, which is a success for the visitor.
      if (r.ok || r.status === 409) return "loops";
      console.error("[newsletter] loops rejected:", r.status);
    } catch (err) {
      console.error("[newsletter] loops unreachable:", (err as Error)?.message);
    }
  }

  if (resendKey && audience) {
    try {
      const r = await fetchImpl(`https://api.resend.com/audiences/${audience}/contacts`, {
        method: "POST",
        headers: { authorization: `Bearer ${resendKey}`, "content-type": "application/json" },
        body: JSON.stringify({ email, unsubscribed: false }),
      });
      if (r.ok || r.status === 409) return "resend";
      console.error("[newsletter] resend rejected:", r.status);
    } catch (err) {
      console.error("[newsletter] resend unreachable:", (err as Error)?.message);
    }
  }

  return null;
}

export async function subscribeEmail(
  rawEmail: string,
  rawSource: string | undefined,
  deps: SignupDeps = {},
): Promise<SignupResult> {
  const getDb = deps.getDb ?? getSignupsDb;
  const fetchImpl = deps.fetchImpl ?? fetch;
  const env = deps.env ?? process.env;
  const email = rawEmail.trim().toLowerCase();
  const source = (rawSource || NEWSLETTER_APP).slice(0, 64);

  const stored = await storeSignup(getDb, email, source);
  const provider = await forwardToProvider(fetchImpl, env, email, source);
  if (stored && provider) await markSynced(getDb, email, provider);

  if (!stored && !provider) {
    console.error("[newsletter] sign-up NOT captured (no Mongo and no provider)", { source });
  }
  return { ok: stored || Boolean(provider), stored, provider };
}
