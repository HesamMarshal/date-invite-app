const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function toAsciiDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));
}

/** MySQL DATETIME: YYYY-MM-DD HH:mm:ss (Tehran wall time) */
export function buildSelectedDatetime(
  date: string,
  time: string
): string | null {
  const d = toAsciiDigits(date.trim());
  const t = toAsciiDigits(time.trim());

  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;

  const match = t.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = match[3] ? Number(match[3]) : 0;

  if (hour > 23 || minute > 59 || second > 59) return null;

  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  const ss = String(second).padStart(2, "0");

  return `${d} ${hh}:${mm}:${ss}`;
}

export function isValidMysqlDatetime(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) return false;

  const [datePart, timePart] = value.split(" ");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm, ss] = timePart.split(":").map(Number);

  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  if (hh > 23 || mm > 59 || ss > 59) return false;

  return true;
}

export const API_ERROR_FA: Record<string, string> = {
  invalid: "درخواست نامعتبره",
  invalid_json: "درخواست نامعتبره",
  invalid_datetime: "تاریخ یا ساعت درست نیست",
  missing_fields: "لطفاً تاریخ، ساعت و انتخاب غذا رو کامل کن",
  not_found: "لینک پیدا نشد",
  expired: "این دعوت منقضی شده",
  rate_limited: "زیاد تلاش کردی، یکم صبر کن",
};
