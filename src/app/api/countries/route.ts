import { NextResponse } from "next/server";
import { getCountries } from "@/lib/wsl-data";

export const revalidate = 86400;

export async function GET() {
  const data = await getCountries();
  return NextResponse.json(data);
}
