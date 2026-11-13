import type { Metadata } from "next";
import { LegalPage, H2, List } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Affiliate policy",
  description: "How World Stats Live earns money from affiliate links.",
  alternates: { canonical: "/legal/affiliates" },
};

export default function AffiliatePolicyPage() {
  return (
    <LegalPage title="Affiliate policy" updated="13 November 2026">
      <p>
        World Stats Live (<code>worldstats.live</code>) is free to read. It is funded by affiliate commissions and
        contextual advertising. This page explains how that works so you can
        make an informed choice when you click an outbound link.
      </p>

      <H2>Programmes we take part in</H2>
      <List>
        <li>
          <strong>Booking.com, Expedia, Agoda</strong> &mdash; hotel links on country and destination pages.
        </li>
        <li>
          <strong>Amazon Associates</strong> &mdash; affiliate tag <code>fs08-21</code> on product links.
        </li>
      </List>

      <H2>What this means for you</H2>
      <List>
        <li>
          Affiliate links are marked <code>rel=&quot;sponsored&quot;</code>, in
          line with the UK CMA and ASA guidance, the FTC Endorsement Guides and
          the EU Digital Services Act.
        </li>
        <li>
          We earn a small commission only when you complete a qualifying
          purchase or booking. You pay the same price either way.
        </li>
        <li>
          Prices shown here are indicative and may be cached. Always check the
          final price on the partner&apos;s site before you book.
        </li>
        <li>
          Rankings are not for sale. Our lists are chosen editorially and do
          not depend on commission rates.
        </li>
      </List>

      <H2>Withdrawing consent</H2>
      <p>
        You can block third-party cookies in your browser at any time. The site
        still works, but the partner may not credit us for your visit.
      </p>

      <p style={{ marginTop: 24, fontSize: 13, opacity: 0.7 }}>
        Questions? <a href="mailto:mat@cleverfox-ai.com" style={{ textDecoration: "underline" }}>mat@cleverfox-ai.com</a>
      </p>
    </LegalPage>
  );
}
