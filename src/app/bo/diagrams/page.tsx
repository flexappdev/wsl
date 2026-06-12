import Link from "next/link";
import { ArrowUpRight, GitBranch, Network, Workflow, FileCode, Database, ListTree, Globe, Grid3x3, Layers } from "lucide-react";

export const metadata = {
  title: "Diagrams",
  description: "Editorial diagrams of the WSL codebase — architecture, auth, data flow, collections, routes, ship pipeline.",
};

type Diagram = {
  slug: string;
  title: string;
  kind: string;
  summary: string;
  Icon: React.ComponentType<{ size?: number }>;
};

const DIAGRAMS: Diagram[] = [
  {
    slug: "architecture",
    title: "Architecture",
    kind: "ARCHITECTURE",
    summary: "Next.js 15 on Vercel · middleware gates /bo on a Supabase allowlist · public routes read Mongo with per-section seed fallback.",
    Icon: Network,
  },
  {
    slug: "auth-sequence",
    title: "Auth sequence",
    kind: "SEQUENCE",
    summary: "How a request to /bo passes through updateSession() — env guard, getSession, allowlist check, then forward or 302.",
    Icon: GitBranch,
  },
  {
    slug: "datasource-flow",
    title: "Data source flow",
    kind: "FLOWCHART",
    summary: "getWslPayload() decides Mongo vs seed per section — the only place the data origin is resolved.",
    Icon: Workflow,
  },
  {
    slug: "collections-er",
    title: "Collections",
    kind: "DATA MODEL",
    summary: "Fourteen wsl_* collections, which pages they feed, and where the Atlas cap forced a seed fallback.",
    Icon: Database,
  },
  {
    slug: "routes-tree",
    title: "Routes",
    kind: "ROUTE TREE",
    summary: "All 26 routes grouped by mode — public ISR, gated dynamic, auth + utility — at a glance.",
    Icon: ListTree,
  },
  {
    slug: "ship-pipeline",
    title: "Ship pipeline",
    kind: "WORKFLOW",
    summary: "PBI → Build → Preview → Push → Deploy. Stage 5 (Vercel link + env sync) is the one owed step.",
    Icon: FileCode,
  },
  {
    slug: "wikivoyage-pipeline",
    title: "Wikivoyage pipeline",
    kind: "INGEST PIPELINE",
    summary: "SEED.allCountries → Wikivoyage bulk → Wikipedia fallback → FLUX heroes → snapshot JSON → 198 SSG pages.",
    Icon: Globe,
  },
  {
    slug: "wikivoyage-coverage",
    title: "Wikivoyage coverage",
    kind: "COVERAGE MAP",
    summary: "Per-region tile grid showing 82 Wikivoyage hits vs 116 Wikipedia fallback hits across all 198 countries.",
    Icon: Grid3x3,
  },
  {
    slug: "wikivoyage-data-sources",
    title: "Wikivoyage data hierarchy",
    kind: "DATA HIERARCHY",
    summary: "How SEED + Wikivoyage + Wikipedia + Runware FLUX merge into a single WikivoyageEntry shape.",
    Icon: Layers,
  },
];

export default function BoDiagramsPage() {
  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumb">BO · DIAGRAMS</div>
          <h1>Codebase, on one page.</h1>
          <div className="sub">
            Six editorial diagrams of the WSL repo — generated via the <code className="mono">/abc-diagrams</code> skill,
            served from <code className="mono">/public/diagrams/</code> as self-contained HTML so they render anywhere.
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 12,
        }}
      >
        {DIAGRAMS.map(({ slug, title, kind, summary, Icon }) => (
          <Link
            key={slug}
            href={`/diagrams/${slug}.html`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              padding: 16,
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: "var(--muted)",
                    color: "var(--foreground)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Icon size={14} />
                </span>
                <span
                  className="type-eyebrow"
                  style={{ fontSize: 10 }}
                >
                  {kind}
                </span>
              </div>
              <ArrowUpRight size={14} style={{ color: "var(--foreground-muted)" }} />
            </div>
            <div style={{ marginTop: 10, fontSize: 15, fontWeight: 600 }}>{title}</div>
            <div
              style={{
                marginTop: 6,
                fontSize: 12.5,
                lineHeight: 1.5,
                color: "var(--foreground-subtle)",
              }}
            >
              {summary}
            </div>
          </Link>
        ))}
      </div>

      <div
        style={{
          marginTop: 24,
          padding: 16,
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          fontSize: 12.5,
          color: "var(--foreground-subtle)",
          lineHeight: 1.6,
        }}
      >
        <div className="type-eyebrow" style={{ marginBottom: 6 }}>HOW THIS WORKS</div>
        Each card opens a self-contained HTML+SVG file under <code className="mono">/diagrams/&lt;slug&gt;</code>.
        Diagrams use the Cleverfox typographic system (Instrument Serif titles, Inter labels, JetBrains Mono
        technical strings) with the WSL emerald accent (<code className="mono">#10b981</code>) reserved for the 1–2
        focal elements per diagram. Every coordinate is on the 4-grid — the fastest way to spot AI-shaped output.
        Regenerate via <code className="mono">/abc-diagrams</code>.
      </div>
    </div>
  );
}
