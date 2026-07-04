// Top-N rankings shared between topic hubs (/climate, /tourism, /gdp) and per-country
// stat pages (/countries/[cca3]). Single source of truth for editorial ranking snapshots.

export type RankedRow = {
  rank: number;
  name: string;
  flag: string;
  /** normalized 0-100 for bar rendering */
  v: number;
  /** raw label to display (e.g. "11.4 Gt") */
  raw: string;
  highlight?: boolean;
};

// CO₂ emitters — Global Carbon Project + IEA 2024
export const TOP_EMITTERS: RankedRow[] = [
  { rank: 1, name: "China",         flag: "🇨🇳", v: 100, raw: "11.4 Gt" },
  { rank: 2, name: "United States", flag: "🇺🇸", v: 44,  raw: "5.0 Gt" },
  { rank: 3, name: "India",         flag: "🇮🇳", v: 26,  raw: "3.0 Gt" },
  { rank: 4, name: "Russia",        flag: "🇷🇺", v: 17,  raw: "1.9 Gt" },
  { rank: 5, name: "Japan",         flag: "🇯🇵", v: 10,  raw: "1.1 Gt" },
  { rank: 6, name: "Iran",          flag: "🇮🇷", v: 7,   raw: "0.8 Gt" },
  { rank: 7, name: "Germany",       flag: "🇩🇪", v: 6,   raw: "0.7 Gt" },
  { rank: 8, name: "Indonesia",     flag: "🇮🇩", v: 6,   raw: "0.7 Gt" },
];

// Renewables share of electricity — IRENA + national grid operators 2024
export const RENEWABLES_SHARE: RankedRow[] = [
  { rank: 1, name: "Iceland",     flag: "🇮🇸", v: 100, raw: "~100%" },
  { rank: 2, name: "Paraguay",    flag: "🇵🇾", v: 100, raw: "~100%" },
  { rank: 3, name: "Norway",      flag: "🇳🇴", v: 98,  raw: "98%" },
  { rank: 4, name: "Costa Rica",  flag: "🇨🇷", v: 95,  raw: "95%" },
  { rank: 5, name: "Brazil",      flag: "🇧🇷", v: 84,  raw: "84%" },
  { rank: 6, name: "Denmark",     flag: "🇩🇰", v: 81,  raw: "81%" },
  { rank: 7, name: "New Zealand", flag: "🇳🇿", v: 81,  raw: "81%" },
  { rank: 8, name: "Portugal",    flag: "🇵🇹", v: 61,  raw: "61%" },
];

// ── Energy ──────────────────────────────────────────────────────────────────
// EIA + BP Statistical Review 2024

export const TOP_ENERGY_PRODUCERS: RankedRow[] = [
  { rank: 1, name: "United States", flag: "🇺🇸", v: 100, raw: "95.4 EJ" },
  { rank: 2, name: "China",         flag: "🇨🇳", v: 92,  raw: "88.1 EJ" },
  { rank: 3, name: "Russia",        flag: "🇷🇺", v: 47,  raw: "45.2 EJ" },
  { rank: 4, name: "Saudi Arabia",  flag: "🇸🇦", v: 30,  raw: "28.8 EJ" },
  { rank: 5, name: "Canada",        flag: "🇨🇦", v: 25,  raw: "24.0 EJ" },
  { rank: 6, name: "India",         flag: "🇮🇳", v: 21,  raw: "20.1 EJ" },
  { rank: 7, name: "Australia",     flag: "🇦🇺", v: 17,  raw: "16.4 EJ" },
  { rank: 8, name: "Iran",          flag: "🇮🇷", v: 15,  raw: "14.7 EJ" },
];

export const ENERGY_PER_CAPITA: RankedRow[] = [
  { rank: 1, name: "Qatar",         flag: "🇶🇦", v: 100, raw: "718 GJ" },
  { rank: 2, name: "Iceland",       flag: "🇮🇸", v: 90,  raw: "648 GJ" },
  { rank: 3, name: "Bahrain",       flag: "🇧🇭", v: 66,  raw: "477 GJ" },
  { rank: 4, name: "Trinidad & Tobago", flag: "🇹🇹", v: 60, raw: "430 GJ" },
  { rank: 5, name: "UAE",           flag: "🇦🇪", v: 57,  raw: "410 GJ" },
  { rank: 6, name: "Norway",        flag: "🇳🇴", v: 53,  raw: "379 GJ" },
  { rank: 7, name: "Kuwait",        flag: "🇰🇼", v: 51,  raw: "365 GJ" },
  { rank: 8, name: "Canada",        flag: "🇨🇦", v: 51,  raw: "364 GJ" },
];

// ── Health ─────────────────────────────────────────────────────────────────
// WHO Global Health Observatory 2024

export const LIFE_EXPECTANCY: RankedRow[] = [
  { rank: 1, name: "Japan",         flag: "🇯🇵", v: 100, raw: "84.6 yrs" },
  { rank: 2, name: "Switzerland",   flag: "🇨🇭", v: 99,  raw: "84.0 yrs" },
  { rank: 3, name: "South Korea",   flag: "🇰🇷", v: 99,  raw: "83.7 yrs" },
  { rank: 4, name: "Spain",         flag: "🇪🇸", v: 98,  raw: "83.5 yrs" },
  { rank: 5, name: "Australia",     flag: "🇦🇺", v: 98,  raw: "83.4 yrs" },
  { rank: 6, name: "Italy",         flag: "🇮🇹", v: 98,  raw: "83.2 yrs" },
  { rank: 7, name: "Iceland",       flag: "🇮🇸", v: 98,  raw: "83.1 yrs" },
  { rank: 8, name: "Israel",        flag: "🇮🇱", v: 97,  raw: "82.9 yrs" },
];

export const HEALTH_SPENDING: RankedRow[] = [
  { rank: 1, name: "United States", flag: "🇺🇸", v: 100, raw: "$12,914" },
  { rank: 2, name: "Switzerland",   flag: "🇨🇭", v: 68,  raw: "$8,724" },
  { rank: 3, name: "Germany",       flag: "🇩🇪", v: 57,  raw: "$7,383" },
  { rank: 4, name: "Norway",        flag: "🇳🇴", v: 55,  raw: "$7,096" },
  { rank: 5, name: "Netherlands",   flag: "🇳🇱", v: 52,  raw: "$6,756" },
  { rank: 6, name: "Austria",       flag: "🇦🇹", v: 50,  raw: "$6,438" },
  { rank: 7, name: "Denmark",       flag: "🇩🇰", v: 50,  raw: "$6,384" },
  { rank: 8, name: "Sweden",        flag: "🇸🇪", v: 48,  raw: "$6,203" },
];

// ── Education ───────────────────────────────────────────────────────────────
// UNESCO Institute for Statistics 2024

export const LITERACY_RATE: RankedRow[] = [
  { rank: 1, name: "Finland",       flag: "🇫🇮", v: 100, raw: "100%" },
  { rank: 2, name: "Norway",        flag: "🇳🇴", v: 100, raw: "100%" },
  { rank: 3, name: "Luxembourg",    flag: "🇱🇺", v: 100, raw: "100%" },
  { rank: 4, name: "Japan",         flag: "🇯🇵", v: 99,  raw: "99%" },
  { rank: 5, name: "Poland",        flag: "🇵🇱", v: 99,  raw: "99%" },
  { rank: 6, name: "Cuba",          flag: "🇨🇺", v: 99,  raw: "99.7%" },
  { rank: 7, name: "Estonia",       flag: "🇪🇪", v: 99,  raw: "99.8%" },
  { rank: 8, name: "Uzbekistan",    flag: "🇺🇿", v: 99,  raw: "100%" },
];

export const TERTIARY_ENROLLMENT: RankedRow[] = [
  { rank: 1, name: "South Korea",   flag: "🇰🇷", v: 100, raw: "98%" },
  { rank: 2, name: "Greece",        flag: "🇬🇷", v: 92,  raw: "90%" },
  { rank: 3, name: "Australia",     flag: "🇦🇺", v: 90,  raw: "88%" },
  { rank: 4, name: "Turkey",        flag: "🇹🇷", v: 88,  raw: "86%" },
  { rank: 5, name: "United States", flag: "🇺🇸", v: 89,  raw: "88%" },
  { rank: 6, name: "Chile",         flag: "🇨🇱", v: 88,  raw: "86%" },
  { rank: 7, name: "Spain",         flag: "🇪🇸", v: 87,  raw: "85%" },
  { rank: 8, name: "Finland",       flag: "🇫🇮", v: 87,  raw: "85%" },
];

// ── Migration ──────────────────────────────────────────────────────────────
// UNHCR + World Bank 2024

export const REFUGEE_HOSTS: RankedRow[] = [
  { rank: 1, name: "Iran",          flag: "🇮🇷", v: 100, raw: "3.77M" },
  { rank: 2, name: "Turkey",        flag: "🇹🇷", v: 88,  raw: "3.30M" },
  { rank: 3, name: "Germany",       flag: "🇩🇪", v: 65,  raw: "2.44M" },
  { rank: 4, name: "Colombia",      flag: "🇨🇴", v: 66,  raw: "2.49M" },
  { rank: 5, name: "Pakistan",      flag: "🇵🇰", v: 51,  raw: "1.94M" },
  { rank: 6, name: "Uganda",        flag: "🇺🇬", v: 43,  raw: "1.63M" },
  { rank: 7, name: "Poland",        flag: "🇵🇱", v: 39,  raw: "1.46M" },
  { rank: 8, name: "Sudan",         flag: "🇸🇩", v: 34,  raw: "1.27M" },
];

export const REMITTANCE_RECEIVERS: RankedRow[] = [
  { rank: 1, name: "India",         flag: "🇮🇳", v: 100, raw: "$125B" },
  { rank: 2, name: "Mexico",        flag: "🇲🇽", v: 52,  raw: "$65B" },
  { rank: 3, name: "China",         flag: "🇨🇳", v: 40,  raw: "$50B" },
  { rank: 4, name: "Philippines",   flag: "🇵🇭", v: 32,  raw: "$40B" },
  { rank: 5, name: "France",        flag: "🇫🇷", v: 25,  raw: "$31B" },
  { rank: 6, name: "Pakistan",      flag: "🇵🇰", v: 24,  raw: "$30B" },
  { rank: 7, name: "Egypt",         flag: "🇪🇬", v: 20,  raw: "$25B" },
  { rank: 8, name: "Bangladesh",    flag: "🇧🇩", v: 18,  raw: "$22B" },
];

// ── Technology ─────────────────────────────────────────────────────────────
// ITU + Ookla + GSMA 2024

export const INTERNET_PENETRATION: RankedRow[] = [
  { rank: 1, name: "UAE",           flag: "🇦🇪", v: 100, raw: "100%" },
  { rank: 2, name: "Qatar",         flag: "🇶🇦", v: 100, raw: "100%" },
  { rank: 3, name: "Kuwait",        flag: "🇰🇼", v: 100, raw: "100%" },
  { rank: 4, name: "Bahrain",       flag: "🇧🇭", v: 100, raw: "100%" },
  { rank: 5, name: "Iceland",       flag: "🇮🇸", v: 99,  raw: "99.7%" },
  { rank: 6, name: "Denmark",       flag: "🇩🇰", v: 99,  raw: "99.4%" },
  { rank: 7, name: "Norway",        flag: "🇳🇴", v: 99,  raw: "99.0%" },
  { rank: 8, name: "South Korea",   flag: "🇰🇷", v: 98,  raw: "98.9%" },
];

export const MOBILE_SPEED: RankedRow[] = [
  { rank: 1, name: "UAE",           flag: "🇦🇪", v: 100, raw: "428 Mbps" },
  { rank: 2, name: "Qatar",         flag: "🇶🇦", v: 92,  raw: "394 Mbps" },
  { rank: 3, name: "Kuwait",        flag: "🇰🇼", v: 68,  raw: "290 Mbps" },
  { rank: 4, name: "Denmark",       flag: "🇩🇰", v: 66,  raw: "281 Mbps" },
  { rank: 5, name: "Bulgaria",      flag: "🇧🇬", v: 63,  raw: "271 Mbps" },
  { rank: 6, name: "Norway",        flag: "🇳🇴", v: 62,  raw: "263 Mbps" },
  { rank: 7, name: "South Korea",   flag: "🇰🇷", v: 60,  raw: "256 Mbps" },
  { rank: 8, name: "Singapore",     flag: "🇸🇬", v: 59,  raw: "252 Mbps" },
];

// ── Hunger ─────────────────────────────────────────────────────────────────
// FAO SOFI 2024 (higher = worse for hunger indices)

export const UNDERNOURISHMENT: RankedRow[] = [
  { rank: 1, name: "Central African Republic", flag: "🇨🇫", v: 100, raw: "48.7%" },
  { rank: 2, name: "Madagascar",    flag: "🇲🇬", v: 100, raw: "48.5%" },
  { rank: 3, name: "DR Congo",      flag: "🇨🇩", v: 82,  raw: "39.8%" },
  { rank: 4, name: "Haiti",         flag: "🇭🇹", v: 94,  raw: "45.6%" },
  { rank: 5, name: "Yemen",         flag: "🇾🇪", v: 79,  raw: "38.9%" },
  { rank: 6, name: "Zimbabwe",      flag: "🇿🇼", v: 76,  raw: "37.4%" },
  { rank: 7, name: "Liberia",       flag: "🇱🇷", v: 76,  raw: "37.2%" },
  { rank: 8, name: "Chad",          flag: "🇹🇩", v: 65,  raw: "31.9%" },
];

export const FOOD_SECURITY_LEADERS: RankedRow[] = [
  { rank: 1, name: "Ireland",       flag: "🇮🇪", v: 100, raw: "81.7" },
  { rank: 2, name: "Norway",        flag: "🇳🇴", v: 99,  raw: "80.5" },
  { rank: 3, name: "France",        flag: "🇫🇷", v: 98,  raw: "80.2" },
  { rank: 4, name: "Netherlands",   flag: "🇳🇱", v: 98,  raw: "79.9" },
  { rank: 5, name: "Japan",         flag: "🇯🇵", v: 97,  raw: "79.5" },
  { rank: 6, name: "Sweden",        flag: "🇸🇪", v: 97,  raw: "79.1" },
  { rank: 7, name: "United States", flag: "🇺🇸", v: 96,  raw: "78.8" },
  { rank: 8, name: "Canada",        flag: "🇨🇦", v: 95,  raw: "78.1" },
];

// ── Conflict ───────────────────────────────────────────────────────────────
// Global Peace Index + SIPRI 2024

export const PEACE_LEADERS: RankedRow[] = [
  { rank: 1, name: "Iceland",       flag: "🇮🇸", v: 100, raw: "1.112" },
  { rank: 2, name: "Ireland",       flag: "🇮🇪", v: 98,  raw: "1.303" },
  { rank: 3, name: "Austria",       flag: "🇦🇹", v: 97,  raw: "1.313" },
  { rank: 4, name: "New Zealand",   flag: "🇳🇿", v: 97,  raw: "1.323" },
  { rank: 5, name: "Singapore",     flag: "🇸🇬", v: 96,  raw: "1.339" },
  { rank: 6, name: "Switzerland",   flag: "🇨🇭", v: 95,  raw: "1.350" },
  { rank: 7, name: "Portugal",      flag: "🇵🇹", v: 95,  raw: "1.372" },
  { rank: 8, name: "Denmark",       flag: "🇩🇰", v: 94,  raw: "1.393" },
];

export const MILITARY_SPENDING: RankedRow[] = [
  { rank: 1, name: "United States", flag: "🇺🇸", v: 100, raw: "$916B" },
  { rank: 2, name: "China",         flag: "🇨🇳", v: 32,  raw: "$296B" },
  { rank: 3, name: "Russia",        flag: "🇷🇺", v: 11,  raw: "$109B" },
  { rank: 4, name: "India",         flag: "🇮🇳", v: 9,   raw: "$84B" },
  { rank: 5, name: "Saudi Arabia",  flag: "🇸🇦", v: 8,   raw: "$76B" },
  { rank: 6, name: "United Kingdom", flag: "🇬🇧", v: 8,  raw: "$75B" },
  { rank: 7, name: "Germany",       flag: "🇩🇪", v: 7,   raw: "$67B" },
  { rank: 8, name: "France",        flag: "🇫🇷", v: 7,   raw: "$61B" },
];

// ── Biodiversity ───────────────────────────────────────────────────────────
// IUCN Red List + WWF 2024

export const SPECIES_RICHNESS: RankedRow[] = [
  { rank: 1, name: "Brazil",        flag: "🇧🇷", v: 100, raw: "~54k species" },
  { rank: 2, name: "Colombia",      flag: "🇨🇴", v: 93,  raw: "~51k species" },
  { rank: 3, name: "China",         flag: "🇨🇳", v: 85,  raw: "~46k species" },
  { rank: 4, name: "Indonesia",     flag: "🇮🇩", v: 82,  raw: "~44k species" },
  { rank: 5, name: "Peru",          flag: "🇵🇪", v: 76,  raw: "~41k species" },
  { rank: 6, name: "Mexico",        flag: "🇲🇽", v: 74,  raw: "~40k species" },
  { rank: 7, name: "Australia",     flag: "🇦🇺", v: 73,  raw: "~40k species" },
  { rank: 8, name: "Ecuador",       flag: "🇪🇨", v: 65,  raw: "~35k species" },
];

export const ENDEMIC_SPECIES: RankedRow[] = [
  { rank: 1, name: "Madagascar",    flag: "🇲🇬", v: 100, raw: "~90% endemic" },
  { rank: 2, name: "Australia",     flag: "🇦🇺", v: 95,  raw: "~87% endemic" },
  { rank: 3, name: "New Zealand",   flag: "🇳🇿", v: 90,  raw: "~82% endemic" },
  { rank: 4, name: "Cuba",          flag: "🇨🇺", v: 65,  raw: "~59% endemic" },
  { rank: 5, name: "Indonesia",     flag: "🇮🇩", v: 43,  raw: "~39% endemic" },
  { rank: 6, name: "Philippines",   flag: "🇵🇭", v: 40,  raw: "~36% endemic" },
  { rank: 7, name: "Brazil",        flag: "🇧🇷", v: 25,  raw: "~23% endemic" },
  { rank: 8, name: "Papua New Guinea", flag: "🇵🇬", v: 22, raw: "~20% endemic" },
];

// ACI World airport pax rankings 2024
export const TOP_AIRPORTS: RankedRow[] = [
  { rank: 1, name: "Atlanta · ATL",     flag: "🇺🇸", v: 100, raw: "104.7M pax" },
  { rank: 2, name: "Dubai · DXB",       flag: "🇦🇪", v: 88,  raw: "92.3M pax" },
  { rank: 3, name: "Dallas · DFW",      flag: "🇺🇸", v: 80,  raw: "83.6M pax" },
  { rank: 4, name: "Tokyo · HND",       flag: "🇯🇵", v: 75,  raw: "78.7M pax" },
  { rank: 5, name: "London · LHR",      flag: "🇬🇧", v: 74,  raw: "77.8M pax" },
  { rank: 6, name: "Denver · DEN",      flag: "🇺🇸", v: 73,  raw: "77.1M pax" },
  { rank: 7, name: "Istanbul · IST",    flag: "🇹🇷", v: 71,  raw: "75.0M pax" },
  { rank: 8, name: "Los Angeles · LAX", flag: "🇺🇸", v: 70,  raw: "74.0M pax" },
];

// Country name aliasing — some seeds use short forms, restcountries uses common name.
// Maps SEED / ranking country names → cca3 for cross-linking to /countries/[cca3].
export const NAME_TO_CCA3: Record<string, string> = {
  "United States": "USA",
  "US": "USA",
  "USA": "USA",
  "China": "CHN",
  "India": "IND",
  "Russia": "RUS",
  "Japan": "JPN",
  "Iran": "IRN",
  "Germany": "DEU",
  "Indonesia": "IDN",
  "Iceland": "ISL",
  "Paraguay": "PRY",
  "Norway": "NOR",
  "Costa Rica": "CRI",
  "Brazil": "BRA",
  "Denmark": "DNK",
  "New Zealand": "NZL",
  "Portugal": "PRT",
  "United Arab Emirates": "ARE",
  "UAE": "ARE",
  "France": "FRA",
  "Spain": "ESP",
  "Italy": "ITA",
  "Turkey": "TUR",
  "Mexico": "MEX",
  "Thailand": "THA",
  "United Kingdom": "GBR",
  "UK": "GBR",
  "Morocco": "MAR",
  "Saudi Arabia": "SAU",
  "Albania": "ALB",
  "El Salvador": "SLV",
  "Serbia": "SRB",
  "Tanzania": "TZA",
  "Qatar": "QAT",
};

export function nameToCca3(name: string): string | undefined {
  return NAME_TO_CCA3[name];
}

export function findRank(rows: RankedRow[], countryName: string): RankedRow | undefined {
  return rows.find((r) => r.name === countryName || nameToCca3(r.name) === nameToCca3(countryName));
}
