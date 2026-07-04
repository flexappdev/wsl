import type { Metadata } from "next";
import { TopicHub } from "@/components/wsl-v2/TopicHub";
import { PEACE_LEADERS, MILITARY_SPENDING } from "@/lib/wsl-v2/rankings";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Conflict & peace",
  description:
    "Global Peace Index leaders, military spending, and the trade-off between security and stability.",
  openGraph: {
    title: "Conflict & peace · World Stats Live",
    description: "Where the world spends on defence and where it lays down arms.",
  },
};

export default async function ConflictPage() {
  return (
    <TopicHub
      crumb="DATA · CONFLICT & PEACE"
      title="Two ways to measure peace."
      lede="Global military spending hit $2.44 trillion in 2024. Iceland has topped the Global Peace Index every year since 2008."
      leftList={{ title: "Most peaceful nations", sub: "GPI score, lower = more peaceful", data: PEACE_LEADERS, color: "var(--ws-core)" }}
      rightList={{ title: "Military spending", sub: "USD, SIPRI 2024", data: MILITARY_SPENDING, color: "var(--ws-context)" }}
      sources={[
        { name: "Institute for Economics & Peace — GPI", url: "https://www.economicsandpeace.org/global-peace-index/" },
        { name: "SIPRI Military Expenditure Database", url: "https://www.sipri.org/databases/milex" },
        { name: "ACLED — Armed Conflict Location & Event Data", url: "https://acleddata.com/" },
      ]}
    />
  );
}
