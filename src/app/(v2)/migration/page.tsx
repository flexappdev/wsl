import type { Metadata } from "next";
import { TopicHub } from "@/components/wsl-v2/TopicHub";
import { REFUGEE_HOSTS, REMITTANCE_RECEIVERS } from "@/lib/wsl-v2/rankings";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Migration",
  description:
    "Global migration flows — top refugee-hosting nations, remittance receivers, and the movement of 300M people who live outside their country of birth.",
  openGraph: {
    title: "Migration · World Stats Live",
    description: "Where the world moves.",
  },
};

export default async function MigrationPage() {
  return (
    <TopicHub
      crumb="DATA · MIGRATION"
      title="The world on the move."
      lede="~300 million people live outside their country of birth — 3.6% of humanity. Remittances reach $860B/year, three times official aid."
      leftList={{ title: "Refugee-hosting nations", sub: "UNHCR total, 2024", data: REFUGEE_HOSTS, color: "var(--ws-context)" }}
      rightList={{ title: "Remittance receivers", sub: "annual inflow, USD, 2024", data: REMITTANCE_RECEIVERS, color: "var(--ws-lists)" }}
      sources={[
        { name: "UNHCR — Global Trends", url: "https://www.unhcr.org/global-trends" },
        { name: "World Bank — Migration & Remittances", url: "https://www.worldbank.org/en/topic/migrationremittancesdiasporaissues" },
        { name: "IOM World Migration Report", url: "https://worldmigrationreport.iom.int/" },
      ]}
    />
  );
}
