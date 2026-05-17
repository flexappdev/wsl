export const APP = {
  id: "wsl",
  name: "World Stats Live",
  long: "Live world numbers",
  tagline: "Live world stats, in plain English.",
  description:
    "Live figures on world population, climate, energy, conflict, and progress — sourced from public datasets, refreshed daily, with one-paragraph explainers next to every chart.",
  accent: "#06b6d4",
  brandWarm: "#22d3ee",
  themeKey: "wsl-theme",
  port: 13011,
  domain: "wsl",
};

export const NAV = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const FEATURES = [
  { title: "Population", body: "Live world + per-country, with trend.", anchor: "population" },
  { title: "Climate", body: "Temperature anomaly, CO₂, sea-level.", anchor: "climate" },
  { title: "Energy", body: "Generation mix, renewables share.", anchor: "energy" },
  { title: "Conflict", body: "Active conflicts, refugees, fatalities.", anchor: "conflict" },
  { title: "Health", body: "Life expectancy, vaccination, mortality.", anchor: "health" },
  { title: "Scroller", body: "Phone-first stats feed.", anchor: "scroller" },
] as const;

export const CATEGORIES = [
  "Population",
  "Climate",
  "Energy",
  "Conflict",
  "Health",
  "Economy",
] as const;
