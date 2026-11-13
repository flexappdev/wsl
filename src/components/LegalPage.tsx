import type { ReactNode } from "react";
import Link from "next/link";

// Shared shell for /legal/* pages. Inline styles inherit the site's colours so
// the page reads correctly in light and dark themes.
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <article style={{ maxWidth: 760, margin: "0 auto", padding: "32px 16px 64px", lineHeight: 1.65, fontSize: 15 }}>
      <header style={{ marginBottom: 24 }}>
        <Link href="/" style={{ fontSize: 13, opacity: 0.7, textDecoration: "underline" }}>&larr; Home</Link>
        <h1 style={{ fontSize: 30, fontWeight: 700, margin: "12px 0 0" }}>{title}</h1>
        <p style={{ marginTop: 8, fontSize: 13, opacity: 0.6 }}>Last updated: {updated}</p>
      </header>
      <div className="legal-body">{children}</div>
    </article>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 style={{ fontSize: 18, fontWeight: 600, margin: "28px 0 8px" }}>{children}</h2>;
}

export function List({ children }: { children: ReactNode }) {
  return <ul style={{ paddingLeft: 22, listStyle: "disc", display: "grid", gap: 6 }}>{children}</ul>;
}
