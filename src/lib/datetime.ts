const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function toAsciiDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** Normalize MySQL DATE / Date / string → YYYY-MM-DD or null */
export function toDateOnly(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`;
  }
  const s = toAsciiDigits(String(value)).trim();
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

/** Normalize MySQL TIME / string → HH:mm or null */
export function toTimeHm(value: unknown): string | null {
  if (value == null || value === "") return null;
  const s = toAsciiDigits(String(value)).trim();
  const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return `${pad2(h)}:${pad2(min)}`;
}

export function timeToMinutes(hm: string): number | null {
  const t = toTimeHm(hm);
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToHm(total: number): string {
  const normalized = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

export function isValidMysqlDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isValidMysqlTimeHm(value: string): boolean {
  return toTimeHm(value) !== null;
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

export type InviteWindows = {
  dateFrom: string | null;
  dateTo: string | null;
  timeFrom: string | null;
  timeTo: string | null;
};

/** Validate optional pairs; returns error code or null if ok. */
export function validateInviteWindows(w: InviteWindows): string | null {
  const hasDateFrom = !!w.dateFrom;
  const hasDateTo = !!w.dateTo;
  if (hasDateFrom !== hasDateTo) return "incomplete_date_window";
  if (hasDateFrom && w.dateFrom && w.dateTo) {
    if (!isValidMysqlDate(w.dateFrom) || !isValidMysqlDate(w.dateTo)) {
      return "invalid_date_window";
    }
    if (w.dateFrom > w.dateTo) return "invalid_date_window";
  }

  const hasTimeFrom = !!w.timeFrom;
  const hasTimeTo = !!w.timeTo;
  if (hasTimeFrom !== hasTimeTo) return "incomplete_time_window";
  if (hasTimeFrom && w.timeFrom && w.timeTo) {
    const from = timeToMinutes(w.timeFrom);
    const to = timeToMinutes(w.timeTo);
    if (from === null || to === null || from > to) return "invalid_time_window";
  }

  return null;
}

export function isSelectedInWindows(
  selectedDatetime: string,
  w: InviteWindows
): boolean {
  if (!isValidMysqlDatetime(selectedDatetime)) return false;
  const [datePart, timePart] = selectedDatetime.split(" ");
  const hm = timePart.slice(0, 5);

  if (w.dateFrom && datePart < w.dateFrom) return false;
  if (w.dateTo && datePart > w.dateTo) return false;

  if (w.timeFrom && w.timeTo) {
    const mins = timeToMinutes(hm);
    const from = timeToMinutes(w.timeFrom);
    const to = timeToMinutes(w.timeTo);
    if (mins === null || from === null || to === null) return false;
    if (mins < from || mins > to) return false;
  }

  return true;
}

export function clampMinutesToWindow(
  minutes: number,
  timeFrom: string | null,
  timeTo: string | null
): number {
  let m = minutes;
  if (timeFrom) {
    const from = timeToMinutes(timeFrom);
    if (from !== null && m < from) m = from;
  }
  if (timeTo) {
    const to = timeToMinutes(timeTo);
    if (to !== null && m > to) m = to;
  }
  return m;
}

export const API_ERROR_FA: Record<string, string> = {
  invalid: "درخواست نامعتبره",
  invalid_json: "درخواست نامعتبره",
  invalid_datetime: "تاریخ یا ساعت درست نیست",
  outside_window: "این تاریخ یا ساعت خارج از بازه مجازه",
  invalid_food: "این گزینه برای این دعوت معتبر نیست",
  missing_fields: "لطفاً تاریخ، ساعت و انتخاب غذا رو کامل کن",
  not_found: "لینک پیدا نشد",
  expired: "این دعوت منقضی شده",
  rate_limited: "زیاد تلاش کردی، یکم صبر کن",
};
