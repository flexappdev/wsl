import type { Metadata } from "next";
import { TopicHub } from "@/components/wsl-v2/TopicHub";
import { SPECIES_RICHNESS, ENDEMIC_SPECIES } from "@/lib/wsl-v2/rankings";
import { getWslPayload } from "@/lib/wsl-v2/dataSource";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Biodiversity",
  description:
    "Global biodiversity — species richness leaders, endemic diversity hotspots, and the accelerating extinction crisis.",
  openGraph: {
    title: "Biodiversity · World Stats Live",
    description: "The 8.7 million species we share the planet with.",
  },
};

export default async function BiodiversityPage() {
  const payload = await getWslPayload();
  const tickers = ["species", "forest"].map((id) => payload.tickers.find((t) => t.id === id)).filter((t): t is NonNullable<typeof t> => Boolean(t));
  return (
    <TopicHub
      crumb="DATA · BIODIVERSITY"
      title="The 8.7 million species we share."
      lede="Brazil harbours ~54,000 known species. Madagascar's forests are 90% endemic. IUCN lists 46,000+ species as threatened — a rate 100× the natural background."
      tickers={tickers}
      epoch={payload.epoch}
      leftList={{ title: "Species richness — top 8", sub: "known species per country", data: SPECIES_RICHNESS, color: "var(--ws-core)" }}
      rightList={{ title: "Endemic species share", sub: "% of species found nowhere else", data: ENDEMIC_SPECIES, color: "var(--ws-lists)" }}
      sources={[
        { name: "IUCN Red List", url: "https://www.iucnredlist.org/" },
        { name: "WWF — Living Planet Report", url: "https://livingplanet.panda.org/" },
        { name: "Global Biodiversity Information Facility (GBIF)", url: "https://www.gbif.org/" },
      ]}
    />
  );
}
