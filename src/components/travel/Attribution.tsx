import { Fragment } from "react";

const URL_RE = /(https?:\/\/[^\s)]+)/g;

function linkify(text: string) {
  return text.split(URL_RE).map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noreferrer nofollow">
        {part.replace(/^https?:\/\/(www\.)?/, "").slice(0, 60)}
        {part.replace(/^https?:\/\/(www\.)?/, "").length > 60 ? "…" : ""}
      </a>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

const FALLBACK =
  "Text adapted from Wikivoyage (https://en.wikivoyage.org/), CC BY-SA 4.0.\nPhotos: Wikimedia Commons contributors, used under their respective free licences.";

/** Renders the detail `attribution` (Wikivoyage CC BY-SA + Wikimedia photo credits). Required. */
export function Attribution({ text, place }: { text: string | null; place: string }) {
  const lines = (text?.trim() ? text : FALLBACK)
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !/^#\w/.test(l)); // drop trailing hashtag line
  const items = lines.filter((l) => l.startsWith("- ")).map((l) => l.slice(2));
  const prose = lines.filter((l) => !l.startsWith("- "));
  return (
    <section className="tv-attr" id="attribution" aria-label="Attribution and licences">
      <h2>Credits &amp; licences</h2>
      {prose.map((l, i) => (
        <p key={i}>{linkify(l)}</p>
      ))}
      {items.length > 0 && (
        <details>
          <summary>
            {items.length} photo credit{items.length === 1 ? "" : "s"} for {place}
          </summary>
          <ul>
            {items.map((l, i) => (
              <li key={i}>{linkify(l)}</li>
            ))}
          </ul>
        </details>
      )}
      <p className="tv-attr-note">
        This video and its text are shared under{" "}
        <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">
          CC BY-SA 4.0
        </a>
        .
      </p>
    </section>
  );
}
