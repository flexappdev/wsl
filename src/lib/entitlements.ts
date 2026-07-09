import { createClient } from "@/lib/supabase/server";

const PRODUCT = "artefaipass";

export type Entitlement = {
  authenticated: boolean;
  pro: boolean;
  userId?: string;
  email?: string;
};

const ANON: Entitlement = { authenticated: false, pro: false };

export async function getEntitlement(): Promise<Entitlement> {
  const supabase = await createClient();
  try {
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user) return ANON;

    // Best-effort read of the shared network entitlements table. Missing table /
    // no policy grant → treat as non-Pro. Never fail the request.
    let pro = false;
    try {
      const s = supabase as unknown as {
        from: (t: string) => {
          select: (cols: string) => {
            eq: (
              col: string,
              val: string,
            ) => {
              eq: (
                col: string,
                val: string,
              ) => {
                eq: (
                  col: string,
                  val: string,
                ) => { maybeSingle: () => Promise<{ data: unknown; error: unknown }> };
              };
            };
          };
        };
      };
      const q = await s
        .from("entitlements")
        .select("status")
        .eq("user_id", user.id)
        .eq("product", PRODUCT)
        .eq("status", "active")
        .maybeSingle();
      pro = Boolean(q?.data);
    } catch {
      pro = false;
    }

    return {
      authenticated: true,
      pro,
      userId: user.id,
      email: user.email ?? undefined,
    };
  } catch {
    return ANON;
  }
}

export { ARTEFAIPASS_CHECKOUT_URL } from "@/lib/artefaipass";
