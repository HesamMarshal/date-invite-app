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

type MysqlLikeError = {
  code?: string;
  errno?: number;
  sqlMessage?: string;
};

function dbFailPayload(err: unknown): {
  error: string;
  code?: string;
  errno?: number;
} {
  const e = err as MysqlLikeError;
  // Safe codes only — never return sqlMessage / credentials to the client
  if (e?.code === "ER_NO_SUCH_TABLE" || e?.errno === 1146) {
    return { error: "db_schema", code: e.code, errno: e.errno };
  }
  if (
    e?.code === "ECONNREFUSED" ||
    e?.code === "ENOTFOUND" ||
    e?.code === "ETIMEDOUT" ||
    e?.code === "ER_ACCESS_DENIED_ERROR" ||
    e?.errno === 1045 ||
    e?.errno === 1049
  ) {
    return { error: "db_connect", code: e.code, errno: e.errno };
  }
  if (e?.code?.startsWith("ER_") || typeof e?.errno === "number") {
    return { error: "db_error", code: e.code, errno: e.errno };
  }
  return { error: "server_error" };
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

  if (
    !process.env.DATABASE_NAME?.trim() ||
    !process.env.DATABASE_USER?.trim()
  ) {
    return NextResponse.json({ error: "db_config" }, { status: 503 });
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
  } catch (err) {
    recordAttempt(ip);
    const payload = dbFailPayload(err);
    // Log code only — never token, hash, or SQL with data
    console.error("[auth/telegram]", payload.error, payload.code ?? "", payload.errno ?? "");
    return NextResponse.json(payload, { status: 500 });
  }
}
