"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

const ACCENTS = [
  { key: "core",    label: "Core",    color: "var(--ws-core)" },
  { key: "lists",   label: "Lists",   color: "var(--ws-lists)" },
  { key: "travel",  label: "Travel",  color: "var(--ws-travel)" },
  { key: "bo",      label: "BO",      color: "var(--ws-bo)" },
  { key: "context", label: "Context", color: "var(--ws-context)" },
];

export function TweaksPanel({ open, onClose }: Props) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [accent, setAccent] = useState("core");
  const [density, setDensity] = useState("default");

  // Load persisted settings on mount
  useEffect(() => {
    try {
      const t = localStorage.getItem("wsl.theme") as "dark" | "light" | null;
      if (t) setTheme(t);
      const a = localStorage.getItem("wsl.accent");
      if (a) setAccent(a);
      const d = localStorage.getItem("wsl.density");
      if (d) setDensity(d);
    } catch { /* ignore */ }
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("wsl.theme", theme); } catch { /* ignore */ }
  }, [theme]);

  // Apply accent
  useEffect(() => {
    document.querySelector(".shell")?.setAttribute("data-accent", accent);
    try { localStorage.setItem("wsl.accent", accent); } catch { /* ignore */ }
  }, [accent]);

  // Apply density
  useEffect(() => {
    document.querySelector(".shell")?.setAttribute("data-density", density);
    try { localStorage.setItem("wsl.density", density); } catch { /* ignore */ }
  }, [density]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {open && <div className="tweaks-overlay" onClick={onClose} />}
      <div className={"tweaks-panel" + (open ? " open" : "")}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Customize</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} type="button">
            <X size={14} />
          </button>
        </div>

        <div className="tweak-section">
          <div className="tweak-section-label">APPEARANCE</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className={"btn btn-sm" + (theme === "dark" ? " btn-primary" : " btn-ghost")}
              type="button"
              onClick={() => setTheme("dark")}
            >
              Dark
            </button>
            <button
              className={"btn btn-sm" + (theme === "light" ? " btn-primary" : " btn-ghost")}
              type="button"
              onClick={() => setTheme("light")}
            >
              Light
            </button>
          </div>
        </div>

        <div className="tweak-section">
          <div className="tweak-section-label">ACCENT COLOR</div>
          <div className="accent-chips">
            {ACCENTS.map((a) => (
              <button
                key={a.key}
                className={"accent-chip" + (accent === a.key ? " active" : "")}
                style={{ background: a.color }}
                title={a.label}
                type="button"
                onClick={() => setAccent(a.key)}
              />
            ))}
          </div>
        </div>

        <div className="tweak-section">
          <div className="tweak-section-label">DENSITY</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className={"btn btn-sm" + (density === "default" ? " btn-primary" : " btn-ghost")}
              type="button"
              onClick={() => setDensity("default")}
            >
              Default
            </button>
            <button
              className={"btn btn-sm" + (density === "compact" ? " btn-primary" : " btn-ghost")}
              type="button"
              onClick={() => setDensity("compact")}
            >
              Compact
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
