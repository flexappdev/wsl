import { NextResponse } from "next/server";
import { getCountry } from "@/lib/wsl-data";

export const revalidate = 86400;

export async function GET(_req: Request, { params }: { params: Promise<{ cca3: string }> }) {
  const { cca3 } = await params;
  const country = await getCountry(cca3.toUpperCase());
  if (!country) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ country });
}
