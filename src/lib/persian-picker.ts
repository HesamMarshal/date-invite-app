import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";
import { isValidMysqlDate, toAsciiDigits } from "./datetime";

const PICKER_FORMAT = "YYYY/MM/DD";

/** Gregorian YYYY-MM-DD → Persian DateObject for react-multi-date-picker. */
export function isoToPersianPickerDate(
  iso: string | null | undefined
): DateObject | undefined {
  if (!iso || !isValidMysqlDate(iso)) return undefined;
  return new DateObject({
    date: iso,
    format: "YYYY-MM-DD",
    calendar: gregorian,
  })
    .convert(persian)
    .setLocale(persianFa);
}

/** Persian picker label → DateObject (accepts Persian or ASCII digits). */
export function persianLabelToPickerDate(
  label: string | null | undefined
): DateObject | undefined {
  if (!label?.trim()) return undefined;
  return new DateObject({
    date: toAsciiDigits(label.trim()),
    format: PICKER_FORMAT,
    calendar: persian,
    locale: persianFa,
  });
}

/** Gregorian YYYY-MM-DD → Persian label for on-screen copy (may use Persian digits). */
export function isoToPersianLabel(
  iso: string | null | undefined
): string | null {
  const d = isoToPersianPickerDate(iso);
  return d ? d.format(PICKER_FORMAT) : null;
}

/** Gregorian YYYY-MM-DD → ASCII Persian label for picker min/max/current props. */
export function isoToPersianPickerLabel(
  iso: string | null | undefined
): string | undefined {
  const d = isoToPersianPickerDate(iso);
  if (!d) return undefined;
  return toAsciiDigits(d.format(PICKER_FORMAT));
}

/** Hint text for guest date window, e.g. «فقط بین ۱۴۰۵/۰۶/۱۱ تا ۱۴۰۵/۰۶/۱۲». */
export function formatPersianDateWindow(
  from: string | null | undefined,
  to: string | null | undefined
): string | null {
  const fromLabel = isoToPersianLabel(from);
  const toLabel = isoToPersianLabel(to);
  if (!fromLabel || !toLabel) return null;
  return `فقط بین ${fromLabel} تا ${toLabel}`;
}

export const persianDatePickerFormat = PICKER_FORMAT;
