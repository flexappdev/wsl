import { getWslPayload } from "@/lib/wsl-v2/dataSource";
import { EmbedPopulation } from "./client";

export const revalidate = 300;

export const metadata = {
  title: "World population — embed",
  robots: "noindex, follow",
};

export default async function EmbedPopulationPage() {
  const payload = await getWslPayload();
  const ticker = payload.tickers.find((t) => t.id === "population");
  if (!ticker) return null;
  return <EmbedPopulation ticker={ticker} epoch={payload.epoch} />;
}
