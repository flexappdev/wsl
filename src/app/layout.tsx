import type { Metadata } from "next";
import "./globals.css";

const SITE_NAME = "World Stats Live";
const SITE_DESC =
  "Live world indicators — population, GDP, climate, tourism. Updated in real time.";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://worldstats.live";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  authors: [{ name: "Mat Siems" }],
  keywords: [
    "world statistics", "live data", "population", "GDP", "climate",
    "tourism", "world clock", "country profiles", "global indicators",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESC,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESC,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
