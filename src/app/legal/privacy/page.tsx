import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, H2, List } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "Privacy and cookie practices for World Stats Live.",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy notice" updated="13 November 2026">
      <p>
        World Stats Live (<code>worldstats.live</code>) is operated from the United Kingdom. We process as little
        personal data as we can and keep preferences in your own browser
        wherever possible.
      </p>

      <H2>What we collect</H2>
      <List>
          <li>
            <strong>Account.</strong> If you sign in we store your email address
            via Supabase authentication.
          </li>
          <li>
            <strong>Newsletter.</strong> If you subscribe we store your email
            address and the site you signed up on, and pass it to our email
            provider to send the newsletter. Every email has an unsubscribe link.
          </li>
          <li>
            <strong>Local preferences.</strong> Theme, view mode and similar
            settings are kept in your browser&apos;s <code>localStorage</code>{" "}
            and never sent to us.
          </li>
          <li>
            <strong>Analytics.</strong> Google Analytics 4 with IP anonymisation.
            It only sets cookies after you click <em>Accept</em> on the cookie
            banner (Google Consent Mode v2, default denied).
          </li>
          <li>
            <strong>Affiliate referral cookies.</strong> Set by our partners
            (for example Amazon or Booking.com) when you click an outbound link,
            so they can credit us for a booking or purchase. See the{" "}
            <Link href="/legal/affiliates" style={{ textDecoration: "underline" }}>affiliate policy</Link>.
          </li>
      </List>

      <H2>Cookies</H2>
      <p>
        We set one first-party cookie, <code>wsl-consent</code>, to remember
        your cookie choice for 12 months. Analytics and advertising cookies are
        only used if you accept. You can change your choice at any time with
        the <em>Cookie settings</em> link in the footer, or block third-party
        cookies in your browser without breaking this site.
      </p>

      <H2>Legal basis and sharing</H2>
      <p>
        We rely on your consent for analytics, advertising and newsletter
        email, and on legitimate interest for keeping the site secure. We do
        not sell personal data. Processors we use include Vercel (hosting),
        MongoDB Atlas and Supabase (storage and sign-in), Google (analytics)
        and our email provider.
      </p>

      <H2>Your rights</H2>
      <p>
        Under UK GDPR and EU GDPR you may ask for access to, correction of,
        or deletion of any personal data we hold, or withdraw consent. Email{" "}
        <a href="mailto:mat@cleverfox-ai.com" style={{ textDecoration: "underline" }}>mat@cleverfox-ai.com</a>{" "}
        and we will reply within 30 days. You can also complain to the UK
        Information Commissioner&apos;s Office (ico.org.uk).
      </p>
    </LegalPage>
  );
}
