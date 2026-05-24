import type { Metadata } from "next";
import { getWslPayload } from "@/lib/wsl-v2/dataSource";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Story · Population",
  description:
    "Five chapters on the steepest demographic curve in human history. 8.15 billion humans, right now.",
  openGraph: {
    title: "Story · Population — World Stats Live",
    description: "Long-form on the steepest demographic curve in history.",
  },
};

export default async function StoryPage() {
  const payload = await getWslPayload();
  const chapters = payload.scroller;

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumb">STORY · POPULATION</div>
          <h1>Population, in motion.</h1>
          <div className="sub">
            Five chapters on the steepest demographic curve in human history. Each chapter is
            anchored to a single number — and a single question we&apos;re still answering.
          </div>
        </div>
      </div>

      <div className="section" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {chapters.map((c, i) => (
          <article
            key={i}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: 28,
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
              gap: 28,
              alignItems: "center",
            }}
          >
            <div>
              <div className="type-eyebrow" style={{ marginBottom: 10 }}>{c.eye}</div>
              <h2
                style={{
                  fontSize: 26,
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  fontWeight: 600,
                  margin: 0,
                  color: "var(--foreground)",
                }}
              >
                {c.title}
              </h2>
              <p
                style={{
                  marginTop: 12,
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: "var(--foreground-subtle)",
                }}
              >
                {c.body}
              </p>
            </div>
            <div
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "24px 20px",
                textAlign: "center",
              }}
            >
              <div
                className="mono"
                style={{
                  fontSize: 38,
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: "var(--ws-core)",
                  lineHeight: 1,
                }}
              >
                {c.bigVal}
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontSize: 11,
                  color: "var(--foreground-muted)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.02em",
                }}
              >
                {c.cap}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="section">
        <div
          className="empty"
          style={{
            padding: "32px 24px",
            textAlign: "center",
          }}
        >
          <div className="empty-title">More stories soon</div>
          <div className="empty-body">
            Climate, tourism and economy long-reads are next in the queue. Got a thread you&apos;d
            like written? <a href="mailto:hello@worldstats.live">hello@worldstats.live</a>
          </div>
        </div>
      </div>
    </div>
  );
}
