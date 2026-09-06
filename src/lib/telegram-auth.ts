import crypto from "crypto";

/** Telegram Login Widget payload (browser → POST /api/auth/telegram). */
export type TelegramWidgetUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

const AUTH_MAX_AGE_SEC = 5 * 60; // 5 minutes (replay window)

/**
 * Verify Telegram Login Widget payload.
 * @see https://core.telegram.org/widgets/login#checking-authorization
 *
 * Returns false for any failure — callers should respond with generic 401
 * (do not distinguish hash vs expiry).
 */
export function verifyTelegramLogin(
  data: Record<string, unknown>
): TelegramWidgetUser | null {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;

  const hash = typeof data.hash === "string" ? data.hash : null;
  if (!hash || !/^[0-9a-f]{64}$/i.test(hash)) return null;

  const id = Number(data.id);
  if (!Number.isInteger(id) || id <= 0) return null;

  const firstName =
    typeof data.first_name === "string" ? data.first_name.trim() : "";
  if (!firstName) return null;

  const authDate = Number(data.auth_date);
  if (!Number.isFinite(authDate) || authDate <= 0) return null;

  const nowSec = Math.floor(Date.now() / 1000);
  // Allow small clock skew forward; reject only if auth_date is too old
  if (authDate > nowSec + 60) return null;
  if (nowSec - authDate > AUTH_MAX_AGE_SEC) return null;

  const checkEntries: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (key === "hash") continue;
    if (value === undefined || value === null) continue;
    checkEntries.push(`${key}=${String(value)}`);
  }
  checkEntries.sort();
  const dataCheckString = checkEntries.join("\n");

  const secretKey = crypto.createHash("sha256").update(token).digest();
  const computed = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  try {
    const a = Buffer.from(computed, "hex");
    const b = Buffer.from(hash.toLowerCase(), "hex");
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  const user: TelegramWidgetUser = {
    id,
    first_name: firstName,
    auth_date: authDate,
    hash: hash.toLowerCase(),
  };

  if (typeof data.last_name === "string" && data.last_name.trim()) {
    user.last_name = data.last_name.trim();
  }
  if (typeof data.username === "string" && data.username.trim()) {
    user.username = data.username.trim().replace(/^@/, "");
  }
  // photo_url ignored (not stored)

  return user;
}

/** Display name from widget first + last name. */
export function telegramDisplayName(user: TelegramWidgetUser): string {
  const parts = [user.first_name, user.last_name].filter(Boolean);
  return parts.join(" ").slice(0, 128);
}

export function getTelegramBotUsername(): string | null {
  const u = process.env.TELEGRAM_BOT_USERNAME?.trim().replace(/^@/, "");
  return u || null;
}
