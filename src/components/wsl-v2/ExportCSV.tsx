"use client";

import { useState } from "react";
import { Download, Lock } from "lucide-react";
import { ARTEFAIPASS_CHECKOUT_URL } from "@/lib/artefaipass";

type Row = Record<string, string | number | null | undefined>;

type Props = {
  pro: boolean;
  filename: string;
  rows: Row[];
  label?: string;
};

function toCsv(rows: Row[]): string {
  if (!rows.length) return "";
  const cols = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

export function ExportCSV({ pro, filename, rows, label = "Export CSV" }: Props) {
  const [ok, setOk] = useState(false);

  function download() {
    if (!pro) {
      window.open(ARTEFAIPASS_CHECKOUT_URL, "_blank", "noopener,noreferrer");
      return;
    }
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setOk(true);
    setTimeout(() => setOk(false), 1500);
  }

  return (
    <button
      onClick={download}
      className={pro ? "btn btn-secondary btn-sm" : "btn btn-ghost btn-sm"}
      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
      title={pro ? "Download as CSV" : "ArtefaiPass required — click to learn more"}
    >
      {pro ? <Download size={13} /> : <Lock size={13} />}
      {ok ? "Downloaded" : label}
      {!pro && <span style={{ marginLeft: 4, fontSize: 10, color: "var(--foreground-muted)" }}>PRO</span>}
    </button>
  );
}
