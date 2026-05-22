import { Sidebar } from "@/components/wsl-v2/Sidebar";
import { Header } from "@/components/wsl-v2/Header";
import { getWslPayload } from "@/lib/wsl-v2/dataSource";

export const revalidate = 300;

export default async function V2Layout({ children }: { children: React.ReactNode }) {
  const payload = await getWslPayload();
  return (
    <div className="shell">
      <Sidebar tickers={payload.tickers} countries={payload.countries} epoch={payload.epoch} />
      <Header />
      <main className="main">
        <div className="main-inner">{children}</div>
      </main>
      <footer className="ft">
        <div>WSL · World Stats Live · v2.0</div>
        <div className="ft-sources">
          <span>data · {payload.source.overall === "mongo" ? `mongo · ${payload.source.dbName}` : "seed (no MONGO_URI)"}</span>
        </div>
      </footer>
    </div>
  );
}
