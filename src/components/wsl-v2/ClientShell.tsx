"use client";

import { useCallback, useEffect, useState } from "react";
import { Header } from "./Header";
import { SearchPalette } from "./SearchPalette";
import { TweaksPanel } from "./TweaksPanel";
import { Sidebar } from "./Sidebar";
import type { WslPayload } from "@/lib/wsl-v2/types";
import type { WslPayloadWithMeta } from "@/lib/wsl-v2/dataSource";

type Props = {
  payload: WslPayloadWithMeta;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function ClientShell({ payload, children, footer }: Props) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [tweakOpen, setTweakOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSearch = useCallback(() => setPaletteOpen(true), []);
  const handleCustomize = useCallback(() => setTweakOpen(true), []);
  const handlePaletteClose = useCallback(() => setPaletteOpen(false), []);
  const handleTweakClose = useCallback(() => setTweakOpen(false), []);

  return (
    <div className="shell">
      <Sidebar tickers={payload.tickers} countries={payload.countries} epoch={payload.epoch} />
      <Header onSearch={handleSearch} onCustomize={handleCustomize} />
      <main className="main">
        <div className="main-inner">{children}</div>
      </main>
      {footer}
      <SearchPalette
        open={paletteOpen}
        onClose={handlePaletteClose}
        countries={payload.countries}
        allCountries={payload.allCountries}
        cities={payload.cities}
      />
      <TweaksPanel open={tweakOpen} onClose={handleTweakClose} />
    </div>
  );
}
