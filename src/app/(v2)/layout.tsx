import Link from "next/link";
import { Shuffle } from "lucide-react";
import { ClientShell } from "@/components/wsl-v2/ClientShell";
import { getWslPayload } from "@/lib/wsl-v2/dataSource";
import { WSL_VERSION } from "@/lib/version";

export const revalidate = false;

export default async function V2Layout({ children }: { children: React.ReactNode }) {
  const payload = await getWslPayload();
  const mode: "live" | "seed" = payload.source.overall === "mongo" ? "live" : "seed";

  const footer = (
    <footer className="ft">
      <div className="ft-brand">
        <span className="badge badge-version">{WSL_VERSION}</span>
        WSL · World Stats Live
      </div>
      <div className="ft-sources">
        <span>data · {mode}</span>
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
