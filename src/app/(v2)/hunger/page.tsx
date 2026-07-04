import type { Metadata } from "next";
import { TopicHub } from "@/components/wsl-v2/TopicHub";
import { UNDERNOURISHMENT, FOOD_SECURITY_LEADERS } from "@/lib/wsl-v2/rankings";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Hunger",
  description:
    "Global hunger and food security — 735 million undernourished, top affected nations, and the countries with the most resilient food systems.",
  openGraph: {
    title: "Hunger · World Stats Live",
    description: "Where the world eats and where it doesn't.",
  },
};

export default async function HungerPage() {
  return (
    <TopicHub
      crumb="DATA · HUNGER"
      title="Fed. Hungry. Somewhere in between."
      lede="735 million people were undernourished in 2024 — one in eleven globally. Africa and West Asia carry the heaviest share; conflict-affected states carry the deepest."
      leftList={{ title: "Highest undernourishment", sub: "% of population, FAO 2024", data: UNDERNOURISHMENT, color: "var(--ws-context)" }}
      rightList={{ title: "Food security leaders", sub: "GFSI score, higher = safer", data: FOOD_SECURITY_LEADERS, color: "var(--ws-core)" }}
      sources={[
        { name: "FAO — State of Food Security (SOFI)", url: "https://www.fao.org/publications/sofi/" },
        { name: "Global Food Security Index", url: "https://impact.economist.com/sustainability/project/food-security-index/" },
        { name: "World Food Programme", url: "https://www.wfp.org/publications" },
      ]}
    />
  );
}
