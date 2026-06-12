"use client";
import { useEffect } from "react";
import { event } from "@/lib/analytics";

export default function WikivoyageViewTracker({
  slug,
  region,
  source,
}: {
  slug: string;
  region: string;
  source: string;
}) {
  useEffect(() => {
    event("wikivoyage_country_view", { slug, region, content_source: source });
  }, [slug, region, source]);
  return null;
}
