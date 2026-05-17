import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WSL · World Stats Live",
  description: "Live country stats from restcountries.com — population, area, currencies, languages, capitals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#0a0a0a] text-zinc-100`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
