import React, { useEffect, useState } from "react";

type PubItem = { id: string; type: string; title: string; tagline?: string; rank?: number };

type PubIndex = { items: PubItem[] };

export default function Published({ site }: { site: string }) {
  const API_BASE = `/bo/api/publish/${site}`;
  const [type, setType] = useState(
    "places" as
      | "places"
      | "history"
      | "books"
      | "movies"
      | "pages"
      | "lists"
      | "images"
      | "audio"
      | "videos"
      | "all"
  );
  const [sort, setSort] = useState<"rank" | "title">("rank");
  const [dir, setDir] = useState<"asc" | "desc">("asc");
  const [items, setItems] = useState<PubItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancel = false;
    const run = async () => {
      setLoading(true);
      setErr(null);
      try {
        const url = `${API_BASE}/index?type=${encodeURIComponent(type)}&limit=200&sort=${encodeURIComponent(
          sort
        )}&dir=${encodeURIComponent(dir)}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`index ${res.status}`);
        const data = (await res.json()) as PubIndex;
        if (!cancel) setItems(data.items || []);
      } catch (e: any) {
        if (!cancel) setErr(e?.message || "failed");
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    run();
    return () => {
      cancel = true;
    };
  }, [API_BASE, type, sort, dir]);

  const scrollRandom = () => {
    if (!items.length) return;
    const idx = Math.floor(Math.random() * items.length);
    const it = items[idx];
    const id = `pub-${it.type}-${it.id}`;
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    try {
      el?.classList.add("ring-2", "ring-pink-500");
      setTimeout(() => el?.classList.remove("ring-2", "ring-pink-500"), 1200);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="font-black">{site.toUpperCase()} • Published (Pattern B)</div>
          <a className="text-xs text-white/70 underline" href="./">Back</a>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <select className="rounded-xl bg-white/10 px-3 py-2 text-sm" value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="places">places</option>
            <option value="history">history</option>
            <option value="books">books</option>
            <option value="movies">movies</option>
            <option value="pages">pages</option>
            <option value="lists">lists</option>
            <option value="images">images</option>
            <option value="audio">audio</option>
            <option value="videos">videos</option>
            <option value="all">all</option>
          </select>
          <select className="rounded-xl bg-white/10 px-3 py-2 text-sm" value={sort} onChange={(e) => setSort(e.target.value as any)}>
            <option value="rank">rank</option>
            <option value="title">title</option>
          </select>
          <select className="rounded-xl bg-white/10 px-3 py-2 text-sm" value={dir} onChange={(e) => setDir(e.target.value as any)}>
            <option value="asc">asc</option>
            <option value="desc">desc</option>
          </select>
          <a className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm" href={`${API_BASE}/index?type=${type}&limit=20&sort=${sort}&dir=${dir}`} target="_blank" rel="noreferrer">index.json</a>
        </div>
        {loading && <div className="mt-2 text-xs text-white/60">Loading…</div>}
        {err && <div className="mt-2 text-xs text-red-300">Error: {err}</div>}
      </div>

      <div className="mx-auto max-w-xl px-3 py-4 pb-28">
        <div className="text-xs text-white/60 mb-3">Items: {items.length}</div>
        <div className="space-y-3">
          {items.map((it) => (
            <a
              id={`pub-${it.type}-${it.id}`}
              key={`${it.type}:${it.id}`}
              className="block rounded-2xl border border-white/10 bg-white/5 p-4"
              href={`${API_BASE}/item/${encodeURIComponent(it.type)}/${encodeURIComponent(it.id)}`}
              target="_blank"
              rel="noreferrer"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-black text-sm truncate">{it.title}</div>
                <div className="text-[10px] text-white/50">#{it.rank ?? "—"}</div>
              </div>
              {it.tagline && <div className="mt-1 text-xs text-white/70">{it.tagline}</div>}
              <div className="mt-2 text-[10px] text-white/50">{it.type} • {it.id}</div>
            </a>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-center px-3 py-3">
          <button className="rounded-xl border border-pink-500/40 bg-pink-500/15 px-4 py-2 text-sm font-black" onClick={scrollRandom}>
            Random
          </button>
        </div>
      </div>
    </div>
  );
}
