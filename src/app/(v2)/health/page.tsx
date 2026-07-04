import type { Metadata } from "next";
import { TopicHub } from "@/components/wsl-v2/TopicHub";
import { LIFE_EXPECTANCY, HEALTH_SPENDING } from "@/lib/wsl-v2/rankings";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Health",
  description:
    "Global health indicators — life expectancy leaders, healthcare spending per capita, and the gap between rich and poor.",
  openGraph: {
    title: "Health · World Stats Live",
    description: "How long people live and what nations spend keeping them alive.",
  },
};

export default async function HealthPage() {
  return (
    <TopicHub
      crumb="DATA · HEALTH"
      title="How long we live, what we spend."
      lede="Global life expectancy is 73.4 years — up from 47 in 1950. The US spends $12,914 per person on healthcare yet ranks 40th on outcomes."
      leftList={{ title: "Life expectancy — top 8", sub: "years at birth, 2024", data: LIFE_EXPECTANCY, color: "var(--ws-core)" }}
      rightList={{ title: "Health spending per capita", sub: "USD PPP, 2024", data: HEALTH_SPENDING, color: "var(--ws-context)" }}
      sources={[
        { name: "WHO Global Health Observatory", url: "https://www.who.int/data/gho" },
        { name: "OECD Health Statistics", url: "https://www.oecd.org/health/health-data.htm" },
        { name: "World Bank — Health Expenditure", url: "https://data.worldbank.org/topic/health" },
      ]}
    />
  );
}
