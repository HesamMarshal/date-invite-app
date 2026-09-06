import { NextRequest, NextResponse } from "next/server";
import { attachSessionCookie, createSession } from "@/lib/session";
import { verifyTelegramLogin } from "@/lib/telegram-auth";
import { upsertUserFromTelegram } from "@/lib/user-queries";

const LOGIN_ATTEMPTS = new Map<string, { count: number; last: number }>();
const MAX_ATTEMPTS = 20;
const WINDOW_MS = 15 * 60 * 1000;

function isBlocked(ip: string): boolean {
  const entry = LOGIN_ATTEMPTS.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.last > WINDOW_MS) {
    LOGIN_ATTEMPTS.delete(ip);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordAttempt(ip: string) {
  const entry = LOGIN_ATTEMPTS.get(ip);
  if (!entry || Date.now() - entry.last > WINDOW_MS) {
    LOGIN_ATTEMPTS.set(ip, { count: 1, last: Date.now() });
  } else {
    entry.count++;
    entry.last = Date.now();
  }
}

/**
 * POST /api/auth/telegram
 * Body = Telegram Login Widget user object.
 * Verify failures → generic 401 (no hash/expiry details).
 */
export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (isBlocked(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (!process.env.TELEGRAM_BOT_TOKEN?.trim()) {
    return NextResponse.json({ error: "config" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    recordAttempt(ip);
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const verified = verifyTelegramLogin(body);
  if (!verified) {
    recordAttempt(ip);
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const user = await upsertUserFromTelegram(verified);
    const sessionId = await createSession(user.id);
    LOGIN_ATTEMPTS.delete(ip);

    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        displayName: user.display_name,
        telegramUsername: user.telegram_username,
      },
    });
    attachSessionCookie(response, sessionId);
    return response;
  } catch {
    // DB / unexpected — do not leak details
    recordAttempt(ip);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
