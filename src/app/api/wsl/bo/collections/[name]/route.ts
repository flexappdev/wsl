import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMongoDb, getMongoDbName } from "@/lib/mongo";
import { ALLOWED_EMAILS } from "@/lib/supabase/middleware";
import { cookies } from "next/headers";

const LIMIT = 50;

async function isAuthed(): Promise<boolean> {
  if (process.env.NODE_ENV === "development") {
    const c = await cookies();
    if (c.get("wsl-dev-bypass")?.value === "1") return true;
  }
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return !!data.user && ALLOWED_EMAILS.includes(data.user.email ?? "");
}

export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { name } = await ctx.params;
  const collectionName = decodeURIComponent(name);
  const db = await getMongoDb();
  if (!db) {
    return NextResponse.json({ error: "mongo unavailable", dbName: getMongoDbName() }, { status: 503 });
  }
  try {
    const coll = db.collection(collectionName);
    const count = await coll.estimatedDocumentCount();
    const raw = await coll.find({}).limit(LIMIT).toArray();
    const docs = raw.map((d) => {
      const out = { ...d } as Record<string, unknown>;
      if (out._id !== undefined) out._id = String(out._id);
      return out;
    });
    return NextResponse.json({ dbName: getMongoDbName(), collection: collectionName, count, docs });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
