import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getMongoDb, getMongoDbName, isMongoConfigured } from "@/lib/mongo";

export const dynamic = "force-dynamic";

async function getCollections(): Promise<{ name: string; count: number }[] | null> {
  const db = await getMongoDb();
  if (!db) return null;
  try {
    const list = await db.listCollections({}, { nameOnly: true }).toArray();
    const rows = await Promise.all(
      list.map(async (c) => ({
        name: c.name,
        count: await db.collection(c.name).estimatedDocumentCount(),
      }))
    );
    rows.sort((a, b) => b.count - a.count);
    return rows;
  } catch {
    return null;
  }
}

export default async function CollectionsPage() {
  const rows = await getCollections();
  const dbName = getMongoDbName();

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumb">ADMIN · COLLECTIONS</div>
          <h1>Collections in {dbName}</h1>
          <div className="sub">Every collection in the connected Mongo database. Click a row to see the first 50 documents.</div>
        </div>
      </div>

      {!isMongoConfigured() && (
        <div className="empty" style={{ marginTop: 20 }}>
          <div className="empty-title">No MONGO_URI configured</div>
          <div className="empty-body">Set MONGO_URI and MONGO_DB in .env.local to browse collections.</div>
        </div>
      )}

      {isMongoConfigured() && rows === null && (
        <div className="empty" style={{ marginTop: 20, borderColor: "var(--destructive)" }}>
          <div className="empty-title" style={{ color: "var(--destructive)" }}>Failed to list collections</div>
          <div className="empty-body">Check that MONGO_URI is reachable and the user has list-collections permissions.</div>
        </div>
      )}

      {rows && rows.length === 0 && (
        <div className="empty" style={{ marginTop: 20 }}>
          <div className="empty-title">No collections found</div>
          <div className="empty-body">The database <code>{dbName}</code> is empty.</div>
        </div>
      )}

      {rows && rows.length > 0 && (
        <div className="top-list" style={{ marginTop: 20 }}>
          {rows.map((c, i) => (
            <Link
              key={c.name}
              href={`/bo/collections/${encodeURIComponent(c.name)}`}
              className="top-list-row"
              style={{ textDecoration: "none" }}
            >
              <span className="rank">{String(i + 1).padStart(2, "0")}</span>
              <div><span className="name mono">{c.name}</span></div>
              <div className="bar-mini" style={{ background: "var(--muted)" }}>
                <div
                  className="bar-mini-fill"
                  style={{
                    width: `${Math.min(100, (c.count / Math.max(1, rows[0].count)) * 100)}%`,
                    background: "var(--ws-bo)",
                  }}
                />
              </div>
              <span className="v">
                {c.count.toLocaleString()} <ChevronRight size={12} style={{ display: "inline", verticalAlign: "middle", color: "var(--foreground-muted)" }} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
