import { NextRequest, NextResponse } from "next/server";
import { markTelegramNotifyOk } from "@/lib/user-queries";
import {
  telegramStartUserId,
  telegramWebhookSecretOk,
} from "@/lib/telegram-webhook";

/**
 * POST /api/telegram/webhook
 * Telegram Bot API webhook. /start → users.telegram_notify_ok_at.
 * Always 200 after auth so Telegram does not retry.
 */
export async function POST(request: NextRequest) {
  if (!process.env.TELEGRAM_BOT_TOKEN?.trim()) {
    return NextResponse.json({ error: "config" }, { status: 503 });
  }
  if (!process.env.TELEGRAM_WEBHOOK_SECRET?.trim()) {
    return NextResponse.json({ error: "config" }, { status: 503 });
  }
  if (!telegramWebhookSecretOk(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const telegramId = telegramStartUserId(body);
  if (telegramId != null) {
    try {
      await markTelegramNotifyOk(telegramId);
    } catch (err) {
      console.error("[telegram/webhook] start", err instanceof Error ? err.message : "error");
    }
  }

  return NextResponse.json({ ok: true });
}
