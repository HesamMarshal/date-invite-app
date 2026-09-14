const SEND_TIMEOUT_MS = 5000;

/** Bot API sendMessage. Never log the token. Failures are logged as status only. */
export async function sendTelegramMessage(
  telegramId: number,
  text: string
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) return;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: telegramId,
      text,
    }),
    signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
  });

  if (!res.ok) {
    console.error("[telegram] sendMessage", res.status);
  }
}
