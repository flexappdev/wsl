// Number/currency formatting helpers — ported from ux/wsl-v2/src/fmt.js.

export const FMT = {
  int: (n: number) => Math.floor(n).toLocaleString("en-US"),
  int2: (n: number) => n.toFixed(2),
  usd: (n: number) => "$" + Math.floor(n).toLocaleString("en-US"),
  tonnes: (n: number) => Math.floor(n).toLocaleString("en-US") + " t",
  kwh: (n: number) => {
    if (n > 1e9) return (n / 1e9).toFixed(2) + " TWh";
    if (n > 1e6) return (n / 1e6).toFixed(2) + " GWh";
    return (n / 1e3).toFixed(2) + " MWh";
  },
  bytes: (n: number) => {
    if (n > 1e18) return (n / 1e18).toFixed(2) + " EB";
    if (n > 1e15) return (n / 1e15).toFixed(2) + " PB";
    if (n > 1e12) return (n / 1e12).toFixed(2) + " TB";
    if (n > 1e9) return (n / 1e9).toFixed(2) + " GB";
    return Math.floor(n).toLocaleString("en-US") + " B";
  },
  sqm: (n: number) => {
    if (n > 1e6) return (n / 1e6).toFixed(2) + " km²";
    return Math.floor(n).toLocaleString("en-US") + " m²";
  },
  short: (n: number) => {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(0) + "k";
    return n.toString();
  },
};

export type FmtKey = keyof typeof FMT;
