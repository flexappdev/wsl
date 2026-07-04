import type { Metadata } from "next";
import { TopicHub } from "@/components/wsl-v2/TopicHub";
import { TOP_ENERGY_PRODUCERS, ENERGY_PER_CAPITA } from "@/lib/wsl-v2/rankings";
import { getWslPayload } from "@/lib/wsl-v2/dataSource";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Energy",
  description:
    "Global energy production and consumption — top producers, per-capita use, and the transition to renewables.",
  openGraph: {
    title: "Energy · World Stats Live",
    description: "Live energy indicators.",
  },
};

export default async function EnergyPage() {
  const payload = await getWslPayload();
  const tickers = ["energy"].map((id) => payload.tickers.find((t) => t.id === id)).filter((t): t is NonNullable<typeof t> => Boolean(t));
  return (
    <TopicHub
      crumb="DATA · ENERGY"
      title="How the world is powered."
      lede="Global primary energy is ~610 EJ/yr and still climbing. Fossil fuels are 80% of the mix; renewables the fastest-growing slice."
      tickers={tickers}
      epoch={payload.epoch}
      leftList={{ title: "Top energy producers", sub: "primary energy, EJ / year", data: TOP_ENERGY_PRODUCERS, color: "var(--ws-context)" }}
      rightList={{ title: "Energy per capita", sub: "gigajoules / person / year", data: ENERGY_PER_CAPITA, color: "var(--ws-core)" }}
      sources={[
        { name: "EIA — International Energy Statistics", url: "https://www.eia.gov/international/" },
        { name: "BP Statistical Review", url: "https://www.energyinst.org/statistical-review" },
        { name: "IEA — World Energy Outlook", url: "https://www.iea.org/reports/world-energy-outlook-2024" },
      ]}
    />
  );
}
