"use client";

import { createBrowserClient } from "@supabase/ssr";

type AnonStub = {
  auth: {
    signInWithPassword: () => Promise<{ data: { user: null; session: null }; error: Error }>;
    signOut: () => Promise<{ error: null }>;
  };
};

const ANON_STUB: AnonStub = {
  auth: {
    signInWithPassword: async () => ({
      data: { user: null, session: null },
      error: new Error("Supabase is not configured for this environment. Set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY."),
    }),
    signOut: async () => ({ error: null }),
  },
};

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return ANON_STUB as unknown as ReturnType<typeof createBrowserClient>;
  }
  return createBrowserClient(url, key);
}
