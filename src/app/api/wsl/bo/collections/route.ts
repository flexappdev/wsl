import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMongoDb, getMongoDbName } from "@/lib/mongo";
import { ALLOWED_EMAILS } from "@/lib/supabase/middleware";
import { cookies } from "next/headers";

async function isAuthed(): Promise<boolean> {
  if (process.env.NODE_ENV === "development") {
    const c = await cookies();
    if (c.get("wsl-dev-bypass")?.value === "1") return true;
  }
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return !!data.user && ALLOWED_EMAILS.includes(data.user.email ?? "");
}

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = await getMongoDb();
  if (!db) {
    return NextResponse.json({ error: "mongo unavailable", dbName: getMongoDbName() }, { status: 503 });
  }
  try {
    const list = await db.listCollections({}, { nameOnly: true }).toArray();
    const collections = await Promise.all(
      list.map(async (c) => ({
        name: c.name,
        count: await db.collection(c.name).estimatedDocumentCount(),
      }))
    );
    collections.sort((a, b) => b.count - a.count);
    return NextResponse.json({ dbName: getMongoDbName(), collections });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
