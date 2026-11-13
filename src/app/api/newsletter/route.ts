import { NextRequest, NextResponse } from "next/server";
import { EMAIL_RE, subscribeEmail } from "@/lib/newsletter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  email?: string;
  source?: string;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }
  const email = (body.email ?? "").trim();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Enter a valid email." }, { status: 400 });
  }

  const result = await subscribeEmail(email, body.source);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: "Sign-up is unavailable right now. Please try again later." },
      { status: 503 },
    );
  }
  return NextResponse.json({ ok: true, stored: result.stored, provider: result.provider });
}

export function GET() {
  return NextResponse.json({ ok: true, route: "newsletter", method: "POST", schema: { email: "string", source: "string?" } });
}
