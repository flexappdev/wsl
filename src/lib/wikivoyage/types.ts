export type WikivoyageEntry = {
  slug: string;
  title: string;
  region: string;
  code: string;
  flag: string;
  extract: string;
  thumbnail?: string;
  original?: string;
  coordinates?: { lat: number; lon: number };
  wikivoyage_url: string;
  pageid: number;
  source?: "wikivoyage" | "wikipedia";
  s3_hero?: boolean;
};

export type WikivoyageDataset = {
  generatedAt: string;
  count: number;
  entries: WikivoyageEntry[];
};
