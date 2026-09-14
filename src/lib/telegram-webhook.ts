import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

function secretOk(header: string, expected: string): boolean {
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function telegramWebhookSecretOk(request: NextRequest): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET?.trim() ?? "";
  if (!expected) return false;
  const got = request.headers.get("x-telegram-bot-api-secret-token") ?? "";
  return secretOk(got, expected);
}

/** Telegram /start or /start@bot or /start notify → from.id, else null. */
export function telegramStartUserId(body: unknown): number | null {
  if (!body || typeof body !== "object") return null;
  const message = (body as { message?: unknown }).message;
  if (!message || typeof message !== "object") return null;
  const text = (message as { text?: unknown }).text;
  if (typeof text !== "string") return null;
  const cmd = text.trim().split(/\s+/)[0];
  if (cmd !== "/start" && !cmd.startsWith("/start@")) return null;
  const from = (message as { from?: unknown }).from;
  if (!from || typeof from !== "object") return null;
  const id = Number((from as { id?: unknown }).id);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}
