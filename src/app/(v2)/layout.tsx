import Link from "next/link";
import { Shuffle } from "lucide-react";
import { ClientShell } from "@/components/wsl-v2/ClientShell";
import { getWslPayload } from "@/lib/wsl-v2/dataSource";

export const revalidate = 300;

export default async function V2Layout({ children }: { children: React.ReactNode }) {
  const payload = await getWslPayload();

  const footer = (
    <footer className="ft">
      <div className="ft-brand">
        <span className="badge badge-version">v2.1</span>
        WSL · World Stats Live
      </div>
      <div className="ft-sources">
        <span>
          data · {payload.source.overall === "mongo"
            ? `mongo · ${payload.source.dbName}`
            : "seed (no MONGO_URI)"}
        </span>
      </div>
      <Link href="/random" className="btn btn-ghost btn-sm ft-random">
        <Shuffle size={13} /> Random
      </Link>
    </footer>
  );

  return (
    <ClientShell payload={payload} footer={footer}>
      {children}
    </ClientShell>
  );
}
