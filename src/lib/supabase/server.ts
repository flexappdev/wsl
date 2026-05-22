import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type AnonStub = {
  auth: {
    getUser: () => Promise<{ data: { user: null }; error: null }>;
    getSession: () => Promise<{ data: { session: null }; error: null }>;
    exchangeCodeForSession: () => Promise<{ data: { session: null }; error: Error }>;
    signOut: () => Promise<{ error: null }>;
  };
};

const ANON_STUB: AnonStub = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    exchangeCodeForSession: async () => ({ data: { session: null }, error: new Error("supabase not configured") }),
    signOut: async () => ({ error: null }),
  },
};

export async function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return ANON_STUB as unknown as ReturnType<typeof createServerClient>;
  }
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component during render — cookies cannot be mutated. Ignore.
          }
        },
      },
    }
  );
}
