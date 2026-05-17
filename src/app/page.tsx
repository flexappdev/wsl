import Link from "next/link";
import { Globe, LayoutGrid, Video, Github, Sparkles, Smartphone } from "lucide-react";

const sections = [
  { href: "/countries", title: "Countries", body: "All 250 countries — population, capital, languages, currencies.", icon: Globe },
  { href: "/scroller", title: "Scroller", body: "Vertical feed across the world.", icon: Smartphone },
  { href: "/apps", title: "Apps", body: "Wider apps catalogue.", icon: LayoutGrid },
  { href: "/videos", title: "Videos", body: "@mat-siems-production on YouTube.", icon: Video },
  { href: "/github", title: "GitHub", body: "Starred repos from @flexappdev.", icon: Github },
  { href: "/prompts", title: "Prompts", body: "Top 100 AI prompts.", icon: Sparkles },
];

export default function HomePage() {
  return (
    <div className="space-y-8 p-8">
      <header className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-zinc-500">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: "var(--app-accent)" }} />
          MS26 · MSTRAVEL · WSL
        </div>
        <h1 className="mt-3 text-4xl font-bold text-zinc-100">World Stats Live</h1>
        <p className="mt-2 text-zinc-400">Country stats live from restcountries.com — populations, capitals, languages, currencies.</p>
      </header>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(({ href, title, body, icon: Icon }) => (
          <Link key={href} href={href} className="group rounded-lg border border-zinc-800 bg-zinc-900/60 p-5 transition-colors hover:border-zinc-700" style={{ borderLeftWidth: 3, borderLeftColor: "var(--app-accent)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-100 group-hover:text-white">{title}</h2>
              <Icon className="h-4 w-4 text-zinc-500 group-hover:text-zinc-200" />
            </div>
            <p className="mt-1 text-xs text-zinc-400">{body}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
