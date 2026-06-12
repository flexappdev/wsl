import { NextResponse } from "next/server";
import { getCountries } from "@/lib/wsl-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getCountries();
  return NextResponse.json(data);
}
