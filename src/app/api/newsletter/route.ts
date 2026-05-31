import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Body {
  email?: string;
  source?: string;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const email = (body.email ?? "").trim();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }
  const source = (body.source ?? "fleet").slice(0, 64);

  const loopsKey = process.env.LOOPS_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const audience = process.env.RESEND_AUDIENCE_ID;

  if (loopsKey) {
    try {
      const r = await fetch("https://app.loops.so/api/v1/contacts/create", {
        method: "POST",
        headers: {
          authorization: `Bearer ${loopsKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ email, source }),
      });
      if (r.ok) return NextResponse.json({ ok: true, provider: "loops" });
    } catch {}
  }

  if (resendKey && audience) {
    try {
      const r = await fetch(`https://api.resend.com/audiences/${audience}/contacts`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${resendKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ email, unsubscribed: false }),
      });
      if (r.ok) return NextResponse.json({ ok: true, provider: "resend" });
    } catch {}
  }

  return NextResponse.json({
    ok: true,
    provider: "echo",
    email,
    source,
    note: "no provider configured — set LOOPS_API_KEY or RESEND_API_KEY+RESEND_AUDIENCE_ID",
  });
}

export function GET() {
  return NextResponse.json({ ok: true, route: "newsletter", method: "POST", schema: { email: "string", source: "string?" } });
}
