import { NextRequest, NextResponse } from "next/server";
import { insertContactMessage } from "@/lib/contact-queries";

const RATE_LIMIT = new Map<string, number[]>();
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (RATE_LIMIT.get(ip) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS
  );
  if (recent.length >= RATE_MAX) {
    RATE_LIMIT.set(ip, recent);
    return true;
  }
  recent.push(now);
  RATE_LIMIT.set(ip, recent);
  return false;
}

function clean(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim().replace(/\s+/g, " ");
  if (!t || t.length > max) return null;
  return t;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Honeypot — bots fill hidden fields
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const name = clean(body.name, 100);
  const contact = clean(body.contact, 200);
  const message = clean(body.message, 2000);

  if (!name) {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }
  if (!contact) {
    return NextResponse.json({ error: "contact_required" }, { status: 400 });
  }
  if (!message || message.length < 10) {
    return NextResponse.json({ error: "message_required" }, { status: 400 });
  }

  try {
    await insertContactMessage({
      name,
      contact,
      message,
      ip: ip === "unknown" ? null : ip,
    });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  // v1 channel: store in DB (admin read later). No SMTP dependency.
  return NextResponse.json({ ok: true });
}
