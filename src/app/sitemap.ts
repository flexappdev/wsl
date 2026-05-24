import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://worldstats.live";

const PUBLIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "",              changeFrequency: "hourly",  priority: 1.0 },
  { path: "/population",   changeFrequency: "hourly",  priority: 0.9 },
  { path: "/gdp",          changeFrequency: "hourly",  priority: 0.9 },
  { path: "/climate",      changeFrequency: "hourly",  priority: 0.9 },
  { path: "/tourism",      changeFrequency: "hourly",  priority: 0.9 },
  { path: "/destinations", changeFrequency: "daily",   priority: 0.8 },
  { path: "/story",        changeFrequency: "weekly",  priority: 0.7 },
  { path: "/about",        changeFrequency: "monthly", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PUBLIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
