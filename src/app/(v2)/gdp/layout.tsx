import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GDP & economy",
  description:
    "What the world is worth. Live GDP, currencies, top economies, and the regional breakdown of $110 trillion.",
  openGraph: {
    title: "GDP & economy · World Stats Live",
    description: "Live world GDP and economic indicators.",
  },
};

export default function GdpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
