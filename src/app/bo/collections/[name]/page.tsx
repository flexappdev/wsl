import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getMongoDb, getMongoDbName } from "@/lib/mongo";

export const dynamic = "force-dynamic";

const SAMPLE_LIMIT = 50;

type Sample = {
  count: number;
  docs: unknown[];
  error?: string;
};

async function getSamples(name: string): Promise<Sample> {
  const db = await getMongoDb();
  if (!db) return { count: 0, docs: [], error: "Mongo not configured." };
  try {
    const coll = db.collection(name);
    const count = await coll.estimatedDocumentCount();
    const docs = await coll.find({}).limit(SAMPLE_LIMIT).toArray();
    return {
      count,
      docs: docs.map((d) => {
        const out = { ...d } as Record<string, unknown>;
        if (out._id !== undefined) out._id = String(out._id);
        return out;
      }),
    };
  } catch (e) {
    return { count: 0, docs: [], error: e instanceof Error ? e.message : String(e) };
  }
}

export default async function CollectionDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const collectionName = decodeURIComponent(name);
  const dbName = getMongoDbName();
  const { count, docs, error } = await getSamples(collectionName);

  return (
    <div>
      <div className="country-page-back">
        <Link href="/bo/collections" className="btn btn-ghost btn-sm">
          <ArrowLeft size={13} /> All collections
        </Link>
        <div className="crumb mono">{dbName} · {collectionName}</div>
      </div>

      <div className="page-head">
        <div>
          <div className="crumb">ADMIN · COLLECTION</div>
          <h1 className="mono">{collectionName}</h1>
          <div className="sub">
            {count.toLocaleString()} documents in <code>{dbName}.{collectionName}</code> · showing first {Math.min(docs.length, SAMPLE_LIMIT)}.
          </div>
        </div>
      </div>

      {error && (
        <div className="empty" style={{ marginTop: 20, borderColor: "var(--destructive)" }}>
          <div className="empty-title" style={{ color: "var(--destructive)" }}>Error</div>
          <div className="empty-body mono">{error}</div>
        </div>
      )}

      {!error && docs.length === 0 && (
        <div className="empty" style={{ marginTop: 20 }}>
          <div className="empty-title">No documents</div>
          <div className="empty-body">This collection is empty.</div>
        </div>
      )}

      {docs.length > 0 && (
        <div className="card" style={{ marginTop: 20, padding: 0 }}>
          <pre
            className="mono"
            style={{
              margin: 0,
              padding: "16px 20px",
              fontSize: 12,
              lineHeight: 1.55,
              color: "var(--foreground-subtle)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxHeight: "70vh",
              overflow: "auto",
            }}
          >
            {JSON.stringify(docs, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
