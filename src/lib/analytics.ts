export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

const PLACEHOLDER = /^G-X+$/i;

export function isAnalyticsEnabled(): boolean {
  if (!GA_ID) return false;
  if (PLACEHOLDER.test(GA_ID)) return false;
  return /^G-[A-Z0-9]{4,}$/i.test(GA_ID);
}

type Params = Record<string, unknown>;

interface GtagWindow {
  gtag?: (...args: unknown[]) => void;
  location?: { href?: string };
}

function gtagWindow(): GtagWindow | null {
  if (typeof window === "undefined") return null;
  return window as unknown as GtagWindow;
}

export function event(name: string, params: Params = {}): void {
  if (!isAnalyticsEnabled()) return;
  const w = gtagWindow();
  if (!w?.gtag) return;
  w.gtag("event", name, params);
}

export function pageview(path: string): void {
  const w = gtagWindow();
  const location = w?.location?.href ?? path;
  event("page_view", {
    page_path: path,
    page_location: location,
    send_to: GA_ID,
  });
}

interface OutboundClick {
  url: string;
  label?: string;
  section?: string;
}

export function trackOutboundClick(c: OutboundClick): void {
  event("outbound_click", {
    url: c.url,
    label: c.label,
    section: c.section,
  });
}
