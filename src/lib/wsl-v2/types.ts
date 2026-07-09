// Shared shape definitions for the WSL v2 dashboard.
//
// FLEET migration (2026-07-09): optional `kind` field on each type mirrors
// the FLEET.items / FLEET.lists / FLEET.videos / FLEET.media discriminator
// applied at fold time (scripts/fold-wsl-to-fleet.mjs). Reads strip the
// synthetic fields before returning to the UI (see dataSource.ts).

import type { FmtKey } from "./fmt";

export type AccentName = "core" | "lists" | "travel" | "bo" | "context";

/**
 * Kind discriminator carried by every folded FLEET doc. Not present on the
 * static seed shapes — only appears on Mongo-sourced rows and is stripped
 * before serialisation to the client.
 */
export type WslKind =
  | "ticker"
  | "currency"
  | "city"
  | "top-visited"
  | "fastest-growing"
  | "largest-gdp"
  | "country"
  | "hotel"
  | "gear"
  | "news"
  | "trending"
  | "fact"
  | "video"
  | "scroller"
  | "flights"
  | "climate";

export type Ticker = {
  id: string;
  label: string;
  icon: string;
  accent: AccentName;
  base: number;
  rate: number;
  oscillate?: { amp: number; period: number };
  fmt: FmtKey;
  sub: string;
  delta: string;
  deltaDown?: boolean;
  kind?: WslKind;
};

export type Currency = {
  code: string;
  val: number;
  ch: number;
  pct: number;
  kind?: WslKind;
};

export type City = {
  id: string;
  name: string;
  country: string;
  x: number;
  y: number;
  pop: number;
  accent: AccentName;
  metric: string;
  kind?: WslKind;
};

export type RankedCountry = {
  rank: number;
  name: string;
  flag: string;
  v: number;
  raw: string;
  highlight?: boolean;
  kind?: WslKind;
};

export type Country = {
  id: string;
  name: string;
  flag: string;
  region: string;
  code: string;
  pop: number;
  gdp: string;
  visitors: string;
  growth: string;
  up: boolean;
  capital: string;
  currency: string;
  langs: string;
  blurb: string;
  featured?: boolean;
  accent: AccentName;
  cities?: string[];
  kind?: WslKind;
};

export type Hotel = {
  name: string;
  city: string;
  stars: number;
  score: number;
  reviews: number;
  price: number;
  art: string;
  kind?: WslKind;
};

export type GearItem = {
  name: string;
  price: string;
  art: string;
  tag?: string;
  kind?: WslKind;
};

export type FeedTemplate = {
  tag: string;
  tpl: string;
};

export type Fact = {
  text: string;
  src: string;
  kind?: WslKind;
};

export type Video = {
  title: string;
  duration: string;
  views: string;
  when: string;
  art: string;
  big?: boolean;
  kind?: WslKind;
};

export type News = {
  title: string;
  src: string;
  when: string;
  tag: string;
  kind?: WslKind;
};

export type Trending = {
  q: string;
  v: string;
  kind?: WslKind;
};

export type ScrollerChapter = {
  eye: string;
  title: string;
  body: string;
  bigVal: string;
  cap: string;
  kind?: WslKind;
};

export type SimpleCountry = {
  name: string;
  flag: string;
  code: string;
  region: string;
};

export type WslPayload = {
  epoch: number;
  tickers: Ticker[];
  currencies: Currency[];
  cities: City[];
  topVisited: RankedCountry[];
  fastestGrowing: RankedCountry[];
  largestGdp: RankedCountry[];
  countries: Country[];
  allCountries: SimpleCountry[];
  hotels: Record<string, Hotel[]>;
  gear: GearItem[];
  feedTemplates: FeedTemplate[];
  feedCities: string[];
  facts: Fact[];
  videos: Video[];
  news: News[];
  trending: Trending[];
  scroller: ScrollerChapter[];
};
