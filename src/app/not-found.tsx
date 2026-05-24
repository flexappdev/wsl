import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Page not found",
  description: "That route doesn't exist on World Stats Live.",
};

export default function NotFound() {
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
            color: "var(--foreground-muted)",
            textTransform: "uppercase",
          }}
        >
          404 · NOT FOUND
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
          That route doesn&apos;t exist.
        </h1>
        <p
          style={{
            marginTop: 12,
            fontSize: 14,
            lineHeight: 1.6,
            color: "var(--foreground-subtle)",
          }}
        >
          The URL you opened isn&apos;t mapped to a page. Try the dashboard or one of
          the sections below.
        </p>
        <div
          style={{
            marginTop: 24,
            display: "flex",
            gap: 8,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/" className="btn btn-primary btn-sm">
            <ArrowLeft size={13} /> Back to dashboard
          </Link>
          <Link href="/population" className="btn btn-ghost btn-sm">Population</Link>
          <Link href="/gdp" className="btn btn-ghost btn-sm">GDP</Link>
          <Link href="/climate" className="btn btn-ghost btn-sm">Climate</Link>
          <Link href="/tourism" className="btn btn-ghost btn-sm">Tourism</Link>
          <Link href="/destinations" className="btn btn-ghost btn-sm">Destinations</Link>
        </div>
      </div>
    </div>
  );
}
