import { NextRequest, NextResponse } from "next/server";
import { checkPassword, setAdminCookie } from "@/lib/admin-auth";

const LOGIN_ATTEMPTS = new Map<string, { count: number; last: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW = 15 * 60 * 1000;

function isBlocked(ip: string): boolean {
  const entry = LOGIN_ATTEMPTS.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.last > WINDOW) {
    LOGIN_ATTEMPTS.delete(ip);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordAttempt(ip: string) {
  const entry = LOGIN_ATTEMPTS.get(ip);
  if (!entry || Date.now() - entry.last > WINDOW) {
    LOGIN_ATTEMPTS.set(ip, { count: 1, last: Date.now() });
  } else {
    entry.count++;
    entry.last = Date.now();
  }
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (isBlocked(ip)) {
    return NextResponse.json(
      { error: "too_many_attempts" },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { password } = body;

  if (!password || typeof password !== "string" || !checkPassword(password)) {
    recordAttempt(ip);
    return NextResponse.json({ error: "wrong_password" }, { status: 401 });
  }

  LOGIN_ATTEMPTS.delete(ip);
  await setAdminCookie();
  return NextResponse.json({ ok: true });
}
