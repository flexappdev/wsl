import NewsletterForm from "./NewsletterForm";

export type Archetype = "product" | "place" | "editorial" | "leadgen" | "utility";

interface PrimaryCta {
  label: string;
  href: string;
}

interface Props {
  archetype: Archetype;
  brand: string;
  disclosure?: string;
  primaryCta?: PrimaryCta;
  showNewsletter?: boolean;
}

const DEFAULT_CTA: Record<Archetype, PrimaryCta> = {
  product: { label: "Shop on Amazon", href: "https://www.amazon.co.uk/?tag=fs08-21" },
  place: { label: "Find a hotel", href: "https://www.booking.com/" },
  editorial: { label: "Read the latest", href: "/" },
  leadgen: { label: "Book a call", href: "/contact" },
  utility: { label: "Unlock premium", href: "/premium" },
};

const DEFAULT_DISCLOSURE =
  "As an Amazon Associate and Booking.com affiliate we earn from qualifying clicks. Links may pay a commission at no extra cost to you.";

export default function MonetisationFooter({
  archetype,
  brand,
  disclosure,
  primaryCta,
  showNewsletter = true,
}: Props) {
  const cta = primaryCta ?? DEFAULT_CTA[archetype];
  const archetypeLabels: Record<Archetype, string> = {
    product: "product",
    place: "place",
    editorial: "editorial",
    leadgen: "leadgen",
    utility: "utility",
  };

  return (
    <footer
      data-archetype={archetypeLabels[archetype]}
      className="mt-12 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50"
    >
      <div className="mx-auto max-w-5xl px-4 py-8 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-2">
            {brand}
          </p>
          <a
            href={cta.href}
            rel={cta.href.startsWith("http") ? "sponsored noopener" : undefined}
            className="inline-flex items-center gap-2 rounded bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-100 dark:text-zinc-900"
          >
            {cta.label} →
          </a>
          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {disclosure ?? DEFAULT_DISCLOSURE}
          </p>
        </div>
        {showNewsletter && (
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-2">
              Newsletter
            </p>
            <NewsletterForm source={brand.toLowerCase()} cta="Subscribe" />
          </div>
        )}
      </div>
    </footer>
  );
}
