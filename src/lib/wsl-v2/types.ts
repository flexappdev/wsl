// Shared shape definitions for the WSL v2 dashboard.

import type { FmtKey } from "./fmt";

export type AccentName = "core" | "lists" | "travel" | "bo" | "context";

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
};

export type Currency = {
  code: string;
  val: number;
  ch: number;
  pct: number;
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
};

export type RankedCountry = {
  rank: number;
  name: string;
  flag: string;
  v: number;
  raw: string;
  highlight?: boolean;
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
};

export type Hotel = {
  name: string;
  city: string;
  stars: number;
  score: number;
  reviews: number;
  price: number;
  art: string;
};

export type GearItem = {
  name: string;
  price: string;
  art: string;
  tag?: string;
};

export type FeedTemplate = {
  tag: string;
  tpl: string;
};

export type Fact = {
  text: string;
  src: string;
};

export type Video = {
  title: string;
  duration: string;
  views: string;
  when: string;
  art: string;
  big?: boolean;
};

export type News = {
  title: string;
  src: string;
  when: string;
  tag: string;
};

export type Trending = {
  q: string;
  v: string;
};

export type ScrollerChapter = {
  eye: string;
  title: string;
  body: string;
  bigVal: string;
  cap: string;
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
