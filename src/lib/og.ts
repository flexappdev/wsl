export interface OgPayload {
  title: string;
  subtitle?: string;
  brand: string;
  accent?: string;
}

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png" as const;
export const OG_RUNTIME = "edge" as const;

export function ogPayload(input: OgPayload): OgPayload {
  return {
    title: input.title.slice(0, 120),
    subtitle: input.subtitle?.slice(0, 160),
    brand: input.brand,
    accent: input.accent ?? "#10b981",
  };
}
