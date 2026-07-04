import type { Metadata } from "next";
import { TopicHub } from "@/components/wsl-v2/TopicHub";
import { INTERNET_PENETRATION, MOBILE_SPEED } from "@/lib/wsl-v2/rankings";
import { getWslPayload } from "@/lib/wsl-v2/dataSource";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Technology",
  description:
    "Global technology indicators — internet penetration, mobile broadband speed, and the countries at the digital frontier.",
  openGraph: {
    title: "Technology · World Stats Live",
    description: "Live tech adoption indicators.",
  },
};

export default async function TechnologyPage() {
  const payload = await getWslPayload();
  const tickers = ["internet", "data"].map((id) => payload.tickers.find((t) => t.id === id)).filter((t): t is NonNullable<typeof t> => Boolean(t));
  return (
    <TopicHub
      crumb="DATA · TECHNOLOGY"
      title="The digital planet."
      lede="5.44 billion people are online — 66% of humanity. Mobile broadband hits 428 Mbps in the UAE. 90% of all data ever created has been made since 2018."
      tickers={tickers}
      epoch={payload.epoch}
      leftList={{ title: "Internet penetration", sub: "% of population online, 2024", data: INTERNET_PENETRATION, color: "var(--ws-core)" }}
      rightList={{ title: "Mobile broadband speed", sub: "median Mbps · Ookla Q4 2024", data: MOBILE_SPEED, color: "var(--ws-lists)" }}
      sources={[
        { name: "ITU — Facts and Figures", url: "https://www.itu.int/en/ITU-D/Statistics/Pages/facts/default.aspx" },
        { name: "Ookla Speedtest Global Index", url: "https://www.speedtest.net/global-index" },
        { name: "GSMA — Mobile Economy", url: "https://www.gsma.com/mobileeconomy/" },
      ]}
    />
  );
}
