import Link from "next/link";
import { Lock } from "lucide-react";
import { ARTEFAIPASS_CHECKOUT_URL } from "@/lib/artefaipass";

type Props = {
  pro: boolean;
  children: React.ReactNode;
  featureLabel?: string;
  cta?: string;
};

export function PassGate({ pro, children, featureLabel = "This is a Pro feature.", cta = "Unlock with ArtefaiPass" }: Props) {
  if (pro) return <>{children}</>;
  return (
    <div style={{ position: "relative" }}>
      <div style={{ filter: "blur(5px)", pointerEvents: "none", userSelect: "none" }} aria-hidden>
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, rgba(11,18,32,0.15), rgba(11,18,32,0.85))",
        }}
      >
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "18px 22px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            maxWidth: 360,
            textAlign: "center",
          }}
        >
          <Lock size={18} style={{ color: "var(--foreground-muted)" }} />
          <div style={{ fontSize: 14, color: "var(--foreground)" }}>{featureLabel}</div>
          <div style={{ fontSize: 12, color: "var(--foreground-muted)" }}>
            £7/month — unlocks compare, CSV export, alerts on every Artefai app.
          </div>
          <Link
            href={ARTEFAIPASS_CHECKOUT_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="btn btn-primary btn-sm"
            style={{ marginTop: 4 }}
          >
            {cta}
          </Link>
        </div>
      </div>
    </div>
  );
}
