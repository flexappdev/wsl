import type { Metadata } from "next";
import { TopicHub } from "@/components/wsl-v2/TopicHub";
import { LITERACY_RATE, TERTIARY_ENROLLMENT } from "@/lib/wsl-v2/rankings";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Education",
  description:
    "Global education indicators — literacy, tertiary enrollment, spending per pupil, and the countries closing the gap.",
  openGraph: {
    title: "Education · World Stats Live",
    description: "How the world teaches its next generation.",
  },
};

export default async function EducationPage() {
  return (
    <TopicHub
      crumb="DATA · EDUCATION"
      title="Who's teaching whom."
      lede="87% of the world can read. 240 million children are still out of school. Higher-ed enrollment doubled in 20 years."
      leftList={{ title: "Literacy — top 8", sub: "% adults literate, 2024", data: LITERACY_RATE, color: "var(--ws-core)" }}
      rightList={{ title: "Tertiary enrollment", sub: "% of tertiary-age population", data: TERTIARY_ENROLLMENT, color: "var(--ws-lists)" }}
      sources={[
        { name: "UNESCO Institute for Statistics", url: "http://uis.unesco.org/" },
        { name: "OECD Education at a Glance", url: "https://www.oecd.org/education/education-at-a-glance/" },
        { name: "World Bank EdStats", url: "https://datatopics.worldbank.org/education/" },
      ]}
    />
  );
}
