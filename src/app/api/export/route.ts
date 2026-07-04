// GET /api/export?topic=<id>&format=csv|json
//
// Machine-readable dumps of the WSL seed datasets.
//
// topics:
//   countries         — 250 countries × 8 cols (from mledoze bundle)
//   wikivoyage        — 198 travel entries × 8 cols
//   top-populous      — top-N population ranking
//   top-gdp           — top-N GDP ranking
//   top-emitters      — top-N CO₂ ranking
//   top-visited       — top-N tourism arrivals
//   top-life-expectancy, top-renewables, top-military-spending, top-refugee-hosts,
//   top-remittances, top-internet, top-literacy, top-species-richness
//
// Format defaults to json. CSV escapes double-quotes and newlines per RFC 4180.

import { NextResponse } from "next/server";
import { getAllCountries } from "@/lib/wsl-v2/country-stats";
import { getWikivoyageDataset } from "@/lib/wikivoyage/data";
import * as rankings from "@/lib/wsl-v2/rankings";
import { SEED } from "@/lib/wsl-v2/seed";

export const dynamic = "force-dynamic";

type Row = Record<string, string | number | undefined | null>;

function toCSV(rows: Row[]): string {
  if (rows.length === 0) return "";
  const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const body = rows.map((r) => headers.map((h) => escape(r[h])).join(",")).join("\n");
  return `${headers.join(",")}\n${body}\n`;
}

async function buildDataset(topic: string): Promise<Row[]> {
  switch (topic) {
    case "countries": {
      const all = await getAllCountries();
      return all.map((c) => ({
        cca3: c.cca3,
        name: c.name,
        official: c.official,
        capital: c.capital,
        region: c.region,
        subregion: c.subregion,
        population: c.population,
        area_km2: c.area,
        languages: c.languages.join("; "),
        currencies: c.currencies.join("; "),
      }));
    }
    case "wikivoyage": {
      const ds = await getWikivoyageDataset();
      return ds.entries.map((e) => ({
        slug: e.slug,
        title: e.title,
        code: e.code,
        region: e.region,
        source: e.source,
        pageid: e.pageid,
        lat: e.coordinates?.lat,
        lon: e.coordinates?.lon,
        s3_hero: e.s3_hero ? 1 : 0,
        wikivoyage_url: e.wikivoyage_url,
        extract_preview: e.extract.slice(0, 240).replace(/\n+/g, " "),
      }));
    }
    case "top-populous": return SEED.allCountries.slice(0, 50).map((c, i) => ({ rank: i + 1, name: c.name, code: c.code, region: c.region }));
    case "top-gdp": return SEED.largestGdp.map((r) => ({ rank: r.rank, name: r.name, gdp: r.raw }));
    case "top-emitters": return rankings.TOP_EMITTERS.map((r) => ({ rank: r.rank, name: r.name, co2_gt_per_year: r.raw }));
    case "top-visited": return SEED.topVisited.map((r) => ({ rank: r.rank, name: r.name, tourists: r.raw }));
    case "top-fastest-growing": return SEED.fastestGrowing.map((r) => ({ rank: r.rank, name: r.name, yoy: r.raw }));
    case "top-life-expectancy": return rankings.LIFE_EXPECTANCY.map((r) => ({ rank: r.rank, name: r.name, years: r.raw }));
    case "top-renewables": return rankings.RENEWABLES_SHARE.map((r) => ({ rank: r.rank, name: r.name, share: r.raw }));
    case "top-military-spending": return rankings.MILITARY_SPENDING.map((r) => ({ rank: r.rank, name: r.name, spend: r.raw }));
    case "top-refugee-hosts": return rankings.REFUGEE_HOSTS.map((r) => ({ rank: r.rank, name: r.name, refugees: r.raw }));
    case "top-remittances": return rankings.REMITTANCE_RECEIVERS.map((r) => ({ rank: r.rank, name: r.name, remittances: r.raw }));
    case "top-internet": return rankings.INTERNET_PENETRATION.map((r) => ({ rank: r.rank, name: r.name, penetration: r.raw }));
    case "top-literacy": return rankings.LITERACY_RATE.map((r) => ({ rank: r.rank, name: r.name, literacy: r.raw }));
    case "top-species-richness": return rankings.SPECIES_RICHNESS.map((r) => ({ rank: r.rank, name: r.name, species: r.raw }));
    case "top-airports": return rankings.TOP_AIRPORTS.map((r) => ({ rank: r.rank, name: r.name, pax: r.raw }));
    default: return [];
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get("topic") ?? "";
  const format = searchParams.get("format") ?? "json";

  const rows = await buildDataset(topic);
  if (rows.length === 0) {
    return NextResponse.json(
      {
        error: `unknown topic: '${topic}'`,
        available: [
          "countries", "wikivoyage",
          "top-populous", "top-gdp", "top-emitters", "top-visited", "top-fastest-growing",
          "top-life-expectancy", "top-renewables", "top-military-spending", "top-refugee-hosts",
          "top-remittances", "top-internet", "top-literacy", "top-species-richness", "top-airports",
        ],
      },
      { status: 400 },
    );
  }

  if (format === "csv") {
    return new NextResponse(toCSV(rows), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="wsl-${topic}.csv"`,
        "cache-control": "public, max-age=3600",
      },
    });
  }

  return NextResponse.json(
    { topic, count: rows.length, rows },
    { headers: { "cache-control": "public, max-age=3600" } },
  );
}
