import type { Invitation } from "./invite-queries";
import { sendTelegramMessage } from "./telegram-bot";
import { getTelegramIdByUserId } from "./user-queries";

function dashboardUrl(): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL || "https://biyabaman.ir").replace(
    /\/$/,
    ""
  );
  return `${base}/dashboard`;
}

/** MySQL DATETIME is Tehran wall time. */
function formatWhenFa(mysqlDatetime: string): string {
  const m = mysqlDatetime.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})/);
  if (!m) return mysqlDatetime;
  const d = new Date(`${m[1]}T${m[2]}:00+03:30`);
  if (isNaN(d.getTime())) return mysqlDatetime;
  const dateFa = d.toLocaleDateString("fa-IR", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const timeFa = d.toLocaleTimeString("fa-IR", {
    timeZone: "Asia/Tehran",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${dateFa} ساعت ${timeFa}`;
}

function acceptText(
  name: string,
  datetime: string,
  food: string
): string {
  return [
    `${name} دعوتت رو قبول کرد ✅`,
    `زمان: ${formatWhenFa(datetime)}`,
    `غذا: ${food}`,
    `جزئیات: ${dashboardUrl()}`,
  ].join("\n");
}

function rejectText(name: string): string {
  return [`${name} دعوتت رو رد کرد`, `جزئیات: ${dashboardUrl()}`].join("\n");
}

/** After a successful /api/respond upsert. Never throws to the caller. */
export async function notifyHostOfResponse(
  invite: Invitation,
  accepted: boolean,
  selectedDatetime: string | null,
  foodChoice: string | null
): Promise<void> {
  if (invite.user_id == null) return;
  if (!accepted && invite.kind !== "real") return;

  try {
    const telegramId = await getTelegramIdByUserId(invite.user_id);
    if (telegramId == null) return;

    const name = invite.recipient_name.trim() || "مهمون";
    const text = accepted
      ? acceptText(name, selectedDatetime ?? "", foodChoice ?? "")
      : rejectText(name);

    await sendTelegramMessage(telegramId, text);
  } catch (err) {
    console.error(
      "[telegram] notify",
      err instanceof Error ? err.name : "error"
    );
  }
}
