import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import gregorian from "react-date-object/calendars/gregorian";
import { isValidMysqlDate } from "./datetime";

/** Gregorian YYYY-MM-DD → Persian DateObject for react-multi-date-picker min/max. */
export function isoToPersianPickerDate(
  iso: string | null | undefined
): DateObject | undefined {
  if (!iso || !isValidMysqlDate(iso)) return undefined;
  return new DateObject({
    date: iso,
    format: "YYYY-MM-DD",
    calendar: gregorian,
  }).convert(persian);
}
