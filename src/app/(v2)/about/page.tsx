import { StubPage } from "@/components/wsl-v2/StubPage";

export default function AboutPage() {
  return (
    <StubPage
      crumb="ABOUT"
      title="Where the numbers come from."
      sub="World Stats Live aggregates open data from international bodies, peer-reviewed datasets, OTAs and the live transport network. Every ticker is anchored to a public source — no estimates without provenance."
    />
  );
}
