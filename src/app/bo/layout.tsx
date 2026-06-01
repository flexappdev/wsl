import Link from "next/link";
import { Activity, Database, FileJson, LogOut, Network } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getMongoDbName, isMongoConfigured } from "@/lib/mongo";

export const dynamic = "force-dynamic";

export default async function BoLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email ?? "(dev bypass)";

  return (
    <div className="shell">
      <aside className="sb">
        <div className="sb-brand">
          <div className="sb-mark"><Database size={18} /></div>
          <div className="sb-name">WSL · BO <span>Backoffice · v2.0</span></div>
        </div>
        <div className="sb-group">
          <div className="type-eyebrow" style={{ padding: "0 10px 6px" }}>ADMIN</div>
          <Link href="/bo" className="nav-item"><Activity size={16} /> Overview</Link>
          <Link href="/bo/collections" className="nav-item"><Database size={16} /> Collections</Link>
          <Link href="/bo/site-data" className="nav-item"><FileJson size={16} /> Site data</Link>
          <Link href="/bo/diagrams" className="nav-item"><Network size={16} /> Diagrams</Link>
        </div>
        <div className="sb-group">
          <div className="type-eyebrow" style={{ padding: "0 10px 6px" }}>SESSION</div>
          <div className="sb-mini">
            <div className="sb-mini-row"><span>USER</span><span className="v">{email}</span></div>
            <div className="sb-mini-row"><span>MONGO</span><span className={"v " + (isMongoConfigured() ? "up" : "down")}>{isMongoConfigured() ? "configured" : "off"}</span></div>
            <div className="sb-mini-row"><span>DB</span><span className="v">{getMongoDbName()}</span></div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div className="sb-group">
          <Link href="/" className="nav-item"><LogOut size={16} /> Back to site</Link>
        </div>
      </aside>
      <header className="hd">
        <div className="hd-globe"><span className="dot" />WSL Backoffice</div>
        <div className="hd-clock mono">{getMongoDbName()} · {isMongoConfigured() ? "live" : "no MONGO_URI"}</div>
        <div className="hd-actions">
          <Link href="/" className="btn btn-ghost btn-sm">Site</Link>
        </div>
      </header>
      <main className="main">
        <div className="main-inner">{children}</div>
      </main>
      <footer className="ft">
        <div>WSL Backoffice · admin tools</div>
        <div className="ft-sources"><span>mongo · {getMongoDbName()}</span></div>
      </footer>
    </div>
  );
}
