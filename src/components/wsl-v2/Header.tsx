"use client";

import { useEffect, useState } from "react";
import { Bell, Bookmark, LogIn, Moon, Search, Settings, Sun } from "lucide-react";

type Props = {
  onSearch?: () => void;
  onCustomize?: () => void;
};

export function Header({ onSearch, onCustomize }: Props) {
  const [now, setNow] = useState<number | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      const stored = (localStorage.getItem("wsl.theme") as "dark" | "light" | null) ?? "dark";
      setTheme(stored);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("wsl.theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const timeLabel = now
    ? (() => {
        const d = new Date(now);
        const hh = String(d.getUTCHours()).padStart(2, "0");
        const mm = String(d.getUTCMinutes()).padStart(2, "0");
        const ss = String(d.getUTCSeconds()).padStart(2, "0");
        const day = String(d.getUTCDate()).padStart(2, "0");
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        return `${hh}:${mm}:${ss} UTC · ${day} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
      })()
    : "—";

  const isDark = theme === "dark";

  return (
    <header className="hd">
      <div className="hd-globe">
        <span className="dot" />
        Live · global
      </div>
      <div className="hd-clock mono">{timeLabel}</div>
      <div className="hd-search">
        <Search size={14} className="ico" />
        <input
          className="input"
          placeholder="Search countries, cities, indicators… Ctrl+S"
          onClick={onSearch}
          onFocus={onSearch}
          readOnly
        />
        <span className="kbd">Ctrl+S</span>
      </div>
      <div className="hd-actions">
        <button
          className="btn btn-ghost btn-sm theme-toggle"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          title={isDark ? "Switch to light" : "Switch to dark"}
          aria-label="Toggle theme"
          type="button"
        >
          {isDark ? <Sun size={13} /> : <Moon size={13} />}
          <span className="theme-toggle-label">{isDark ? "Light" : "Dark"}</span>
        </button>
        <button className="btn btn-ghost btn-sm" type="button" onClick={onCustomize}>
          <Settings size={13} /> Customize
        </button>
        <button className="btn btn-ghost btn-sm" type="button">
          <LogIn size={13} /> Login
        </button>
        <button className="btn btn-ghost btn-icon" title="Notifications" type="button">
          <Bell size={14} />
        </button>
        <button className="btn btn-ghost btn-icon" title="Saved" type="button">
          <Bookmark size={14} />
        </button>
      </div>
    </header>
  );
}
