"use client";

import type { ReactNode } from "react";
import DatePicker from "react-multi-date-picker";
import type { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";
import { toAsciiDigits } from "@/lib/datetime";
import {
  isoToPersianPickerLabel,
  persianDatePickerFormat,
  persianLabelToPickerDate,
} from "@/lib/persian-picker";

type MapDaysFn = NonNullable<
  React.ComponentProps<typeof DatePicker>["mapDays"]
>;

type Props = {
  label: string;
  placeholder: string;
  inputClass: string;
  containerClassName?: string;
  onPick: (persianLabel: string, gregorianIso: string) => void;
  onClear?: () => void;
  /** Gregorian YYYY-MM-DD bounds (optional). */
  minIso?: string | null;
  maxIso?: string | null;
  /** Persian label min bound (admin to-date; optional). */
  minLabel?: string | null;
};

export default function PersianDatePickerField({
  label,
  placeholder,
  inputClass,
  containerClassName = "w-full",
  onPick,
  onClear,
  minIso,
  maxIso,
  minLabel,
}: Props) {
  const minDate =
    (minLabel?.trim() ? toAsciiDigits(minLabel.trim()) : undefined) ||
    isoToPersianPickerLabel(minIso) ||
    undefined;
  const maxDate = isoToPersianPickerLabel(maxIso);
  const hasWindow = !!(minDate && maxDate);
  const currentDate =
    persianLabelToPickerDate(minDate) ??
    persianLabelToPickerDate(maxDate);

  const mapDays: MapDaysFn | undefined =
    minIso || maxIso
      ? ({ date }) => {
          const g = toAsciiDigits(
            (date as DateObject).convert(gregorian).format("YYYY-MM-DD")
          );
          if (minIso && g < minIso) return { disabled: true };
          if (maxIso && g > maxIso) return { disabled: true };
          return {};
        }
      : minLabel
        ? ({ date }) => {
            const picked = toAsciiDigits(
              (date as DateObject).format(persianDatePickerFormat)
            );
            const min = toAsciiDigits(minLabel);
            if (picked < min) return { disabled: true };
            return {};
          }
        : undefined;

  return (
    <DatePicker
      key={hasWindow ? `w-${minDate}-${maxDate}` : "open"}
      calendar={persian}
      locale={persianFa}
      format={persianDatePickerFormat}
      value={label ? persianLabelToPickerDate(label) : undefined}
      editable={false}
      calendarPosition="bottom-center"
      containerClassName={containerClassName}
      minDate={minDate}
      maxDate={maxDate}
      currentDate={currentDate}
      disableMonthPicker={hasWindow}
      disableYearPicker={hasWindow}
      mapDays={mapDays}
      render={(_value, openCalendar): ReactNode => (
        <input
          readOnly
          type="text"
          inputMode="none"
          onClick={openCalendar}
          value={label}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
      onChange={(value) => {
        if (!value || Array.isArray(value)) {
          onClear?.();
          return;
        }
        const pickedLabel = value.format(persianDatePickerFormat);
        const iso = toAsciiDigits(
          value.convert(gregorian).format("YYYY-MM-DD")
        );
        onPick(pickedLabel, iso);
      }}
    />
  );
}
