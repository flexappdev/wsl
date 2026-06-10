import { getWikivoyageDataset, getWikivoyageByRegion } from "@/lib/wikivoyage/data";

export const dynamic = "force-dynamic";

export default async function BoWikivoyagePage() {
  const [ds, byRegion] = await Promise.all([
    getWikivoyageDataset(),
    getWikivoyageByRegion(),
  ]);

  const regionRows = Object.entries(byRegion)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([region, entries]) => ({ region, count: entries.length }));

  const withThumb = ds.entries.filter((e) => e.thumbnail).length;
  const withCoords = ds.entries.filter((e) => e.coordinates).length;

  return (
    <div className="bo-page">
      <h1 className="bo-title">Wikivoyage snapshot</h1>

      <div className="bo-stat-grid">
        <div className="bo-stat">
          <div className="bo-stat-val">{ds.count}</div>
          <div className="bo-stat-lbl">countries ingested</div>
        </div>
        <div className="bo-stat">
          <div className="bo-stat-val">{withThumb}</div>
          <div className="bo-stat-lbl">with thumbnail</div>
        </div>
        <div className="bo-stat">
          <div className="bo-stat-val">{withCoords}</div>
          <div className="bo-stat-lbl">with coordinates</div>
        </div>
        <div className="bo-stat">
          <div className="bo-stat-val">{regionRows.length}</div>
          <div className="bo-stat-lbl">regions</div>
        </div>
      </div>

      <p className="bo-meta">
        Generated: {ds.generatedAt ? new Date(ds.generatedAt).toLocaleString() : "—"} ·
        Snapshot at <code>public/data/wikivoyage-countries.json</code>
      </p>

      <h2 className="bo-section-title">Entries by region</h2>
      <table className="bo-table">
        <thead>
          <tr>
            <th>Region</th>
            <th>Countries</th>
          </tr>
        </thead>
        <tbody>
          {regionRows.map((r) => (
            <tr key={r.region}>
              <td>{r.region}</td>
              <td>{r.count}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="bo-section-title">All entries</h2>
      <table className="bo-table">
        <thead>
          <tr>
            <th>Flag</th>
            <th>Country</th>
            <th>Region</th>
            <th>Thumb</th>
            <th>Coords</th>
            <th>Slug</th>
          </tr>
        </thead>
        <tbody>
          {ds.entries.map((e) => (
            <tr key={e.slug}>
              <td>{e.flag}</td>
              <td>
                <a href={`/wikivoyage/${e.slug}`} className="bo-link">
                  {e.title}
                </a>
              </td>
              <td className="bo-muted">{e.region}</td>
              <td>{e.thumbnail ? "✓" : "—"}</td>
              <td>{e.coordinates ? "✓" : "—"}</td>
              <td className="bo-mono">{e.slug}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <style>{`
        .bo-page { padding: 1.5rem; }
        .bo-title { font-size: 1.25rem; font-weight: 700; margin: 0 0 1.5rem; }
        .bo-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1rem; }
        .bo-stat { background: var(--paper-2, #1a1a1a); border: 1px solid var(--border, #2a2a2a);
          border-radius: 8px; padding: 1rem; text-align: center; }
        .bo-stat-val { font-size: 1.75rem; font-weight: 700; color: var(--accent, #10b981); }
        .bo-stat-lbl { font-size: 0.78rem; color: var(--muted); margin-top: 0.25rem; }
        .bo-meta { font-size: 0.8rem; color: var(--muted); margin-bottom: 2rem; }
        .bo-meta code { background: var(--paper-2, #1a1a1a); padding: 0.1em 0.35em; border-radius: 3px; font-size: 0.85em; }
        .bo-section-title { font-size: 0.95rem; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.05em; color: var(--accent, #10b981); margin: 2rem 0 0.75rem; }
        .bo-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        .bo-table th { text-align: left; padding: 0.4rem 0.75rem; border-bottom: 1px solid var(--border, #2a2a2a);
          color: var(--muted); font-weight: 500; white-space: nowrap; }
        .bo-table td { padding: 0.35rem 0.75rem; border-bottom: 1px solid var(--border, #1a1a1a); }
        .bo-link { color: var(--accent, #10b981); text-decoration: none; }
        .bo-link:hover { text-decoration: underline; }
        .bo-muted { color: var(--muted); }
        .bo-mono { font-family: monospace; font-size: 0.8em; }
      `}</style>
    </div>
  );
}
