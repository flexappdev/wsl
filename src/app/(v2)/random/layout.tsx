import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Random",
  description: "Spin the globe — a random fact, country, or world stat.",
};

export default function RandomLayout({ children }: { children: React.ReactNode }) {
  return children;
}
