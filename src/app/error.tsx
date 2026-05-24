"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[wsl] unhandled route error", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
        background: "var(--background)",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 460 }}>
        <div
          className="mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.1em",
            color: "var(--destructive)",
            textTransform: "uppercase",
          }}
        >
          500 · SOMETHING BROKE
        </div>
        <h1
          style={{
            marginTop: 16,
            fontSize: 36,
            letterSpacing: "-0.02em",
            fontWeight: 600,
            color: "var(--foreground)",
          }}
        >
          We hit an unexpected error.
        </h1>
        <p
          style={{
            marginTop: 12,
            fontSize: 14,
            lineHeight: 1.6,
            color: "var(--foreground-subtle)",
          }}
        >
          The error was logged. Try again, or head back to the dashboard.
        </p>
        {error.digest && (
          <p
            className="mono"
            style={{
              marginTop: 8,
              fontSize: 11,
              color: "var(--foreground-muted)",
            }}
          >
            digest: {error.digest}
          </p>
        )}
        <div
          style={{
            marginTop: 24,
            display: "flex",
            gap: 8,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button onClick={reset} className="btn btn-primary btn-sm">
            <RefreshCcw size={13} /> Try again
          </button>
          <Link href="/" className="btn btn-ghost btn-sm">Back to dashboard</Link>
        </div>
      </div>
    </div>
  );
}
