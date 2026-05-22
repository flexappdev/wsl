"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const ERROR_LABELS: Record<string, string> = {
  unauthorized: "This account is not authorized.",
  auth: "Sign in failed. Please try again.",
};

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialError = ERROR_LABELS[params.get("error") ?? ""] ?? "";
  const [email, setEmail] = useState("mat@matsiems.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
      const next = params.get("next") ?? "/bo";
      router.push(next.startsWith("/") ? next : "/bo");
      router.refresh();
    } catch {
      setError("Unable to reach the auth service. Check your connection and try again.");
      setLoading(false);
    }
  }

  function handleDevLogin() {
    document.cookie = "wsl-dev-bypass=1; path=/; max-age=86400";
    router.push("/bo");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div
        className="w-full max-w-sm rounded-lg p-6"
        style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}
      >
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--app-accent)" }} />
            <span className="font-semibold" style={{ color: "var(--foreground)" }}>WSL · Backoffice</span>
          </Link>
          <h1 className="text-xl font-semibold" style={{ color: "var(--foreground)" }}>Sign in</h1>
          <p className="text-xs mt-1" style={{ color: "var(--foreground-muted)" }}>
            Admin access restricted to mat@matsiems.com
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs" style={{ color: "var(--foreground-muted)" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="input"
              style={{ width: "100%" }}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs" style={{ color: "var(--foreground-muted)" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input"
              style={{ width: "100%" }}
            />
          </div>
          {error && <p className="text-xs" style={{ color: "var(--destructive)" }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", opacity: loading ? 0.5 : 1 }}
          >
            {loading && <Loader2 className="h-3 w-3 animate-spin" />}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
            <button
              onClick={handleDevLogin}
              type="button"
              className="text-xs py-1.5 rounded transition-colors"
              style={{
                width: "100%",
                color: "var(--foreground-muted)",
                border: "1px dashed var(--border)",
              }}
            >
              Dev login (skip auth — local only)
            </button>
          </div>
        )}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs transition-colors"
            style={{ color: "var(--foreground-muted)" }}
          >
            <ArrowLeft className="h-3 w-3" /> Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm" style={{ color: "var(--foreground-muted)" }}>Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
