import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getMongoDb, getMongoDbName, isMongoConfigured } from "@/lib/mongo";

export const dynamic = "force-dynamic";

type Health = {
  configured: boolean;
  connected: boolean;
  dbName: string;
  collectionCount: number;
  topCollections: { name: string; count: number }[];
  error?: string;
};

async function getHealth(): Promise<Health> {
  const dbName = getMongoDbName();
  const configured = isMongoConfigured();
  if (!configured) {
    return { configured: false, connected: false, dbName, collectionCount: 0, topCollections: [] };
  }
  try {
    const db = await getMongoDb();
    if (!db) {
      return { configured: true, connected: false, dbName, collectionCount: 0, topCollections: [], error: "Failed to connect to Mongo." };
    }
    const collections = await db.listCollections({}, { nameOnly: true }).toArray();
    const counts = await Promise.all(
      collections.slice(0, 12).map(async (c) => ({
        name: c.name,
        count: await db.collection(c.name).estimatedDocumentCount(),
      }))
    );
    counts.sort((a, b) => b.count - a.count);
    return {
      configured: true,
      connected: true,
      dbName,
      collectionCount: collections.length,
      topCollections: counts,
    };
  } catch (e) {
    return {
      configured: true,
      connected: false,
      dbName,
      collectionCount: 0,
      topCollections: [],
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export default async function BoOverviewPage() {
  const h = await getHealth();
  const status = !h.configured ? "off" : h.connected ? "live" : "error";
  const statusColor = status === "live" ? "var(--success)" : status === "error" ? "var(--destructive)" : "var(--foreground-muted)";

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumb">ADMIN · OVERVIEW</div>
          <h1>Backoffice</h1>
          <div className="sub">
            Test the Mongo integration, browse collections in <code>{h.dbName}</code>, and inspect the v2 payload the site renders.
          </div>
        </div>
      </div>

      <div className="ticker-grid" style={{ marginTop: 18 }}>
        <div className="ticker">
          <div className="ticker-accent" style={{ background: statusColor }} />
          <div className="ticker-head"><div className="ticker-label">Mongo status</div></div>
          <div className="ticker-value" style={{ fontSize: 22 }}>{status}</div>
          <div className="ticker-delta">{h.configured ? "MONGO_URI set" : "MONGO_URI unset → site uses seed"}</div>
        </div>
        <div className="ticker">
          <div className="ticker-accent" />
          <div className="ticker-head"><div className="ticker-label">Database</div></div>
          <div className="ticker-value" style={{ fontSize: 22 }}>{h.dbName}</div>
          <div className="ticker-delta">MONGO_DB env</div>
        </div>
        <div className="ticker">
          <div className="ticker-accent" />
          <div className="ticker-head"><div className="ticker-label">Collections</div></div>
          <div className="ticker-value" style={{ fontSize: 22 }}>{h.collectionCount}</div>
          <div className="ticker-delta">in {h.dbName}</div>
        </div>
        <div className="ticker">
          <div className="ticker-accent" />
          <div className="ticker-head"><div className="ticker-label">Browse</div></div>
          <div className="ticker-value" style={{ fontSize: 22 }}>
            <Link href="/bo/collections" style={{ color: "var(--foreground)" }}>open →</Link>
          </div>
          <div className="ticker-delta">full collection list + sample docs</div>
        </div>
      </div>

      {h.error && (
        <div className="empty" style={{ marginTop: 20, borderColor: "var(--destructive)" }}>
          <div className="empty-title" style={{ color: "var(--destructive)" }}>Mongo error</div>
          <div className="empty-body mono">{h.error}</div>
        </div>
      )}

      {h.topCollections.length > 0 && (
        <div className="section">
          <div className="section-head">
            <div>
              <h2>Top collections by document count</h2>
              <div className="sub">Showing up to 12 — click through for the full list.</div>
            </div>
            <div className="right">
              <Link href="/bo/collections" className="btn btn-secondary btn-sm">All collections <ChevronRight size={12} /></Link>
            </div>
          </div>
          <div className="top-list">
            {h.topCollections.map((c, i) => (
              <Link key={c.name} href={`/bo/collections/${encodeURIComponent(c.name)}`} className="top-list-row" style={{ textDecoration: "none" }}>
                <span className="rank">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <span className="name mono">{c.name}</span>
                </div>
                <div className="bar-mini" style={{ background: "var(--muted)" }}>
                  <div className="bar-mini-fill" style={{ width: `${Math.min(100, (c.count / Math.max(1, h.topCollections[0].count)) * 100)}%`, background: "var(--ws-bo)" }} />
                </div>
                <span className="v">{c.count.toLocaleString()}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
