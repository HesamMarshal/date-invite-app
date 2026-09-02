"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";
import { DEFAULT_INVITE_TEXT } from "@/lib/invite-defaults";
import { buildSelectedDatetime, toAsciiDigits } from "@/lib/datetime";
import {
  MAX_INVITE_OPTIONS,
  MIN_INVITE_OPTIONS,
} from "@/lib/food-options";

type OptionItem = { id: number; emoji: string; label: string };

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function TimeColumn({
  value,
  label,
  onInc,
  onDec,
}: {
  value: string;
  label: string;
  onInc: () => void;
  onDec: () => void;
}) {
  const btn =
    "flex h-10 w-12 items-center justify-center rounded-xl bg-pink-50 text-pink-600 text-sm font-bold transition active:scale-95 active:bg-pink-100";
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button type="button" aria-label={`${label} بیشتر`} onClick={onInc} className={btn}>
        ▲
      </button>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-pink-200 bg-white text-xl font-bold tabular-nums">
        {value}
      </div>
      <button type="button" aria-label={`${label} کمتر`} onClick={onDec} className={btn}>
        ▼
      </button>
      <span className="text-[10px] text-zinc-400">{label}</span>
    </div>
  );
}

function TimeStepper({
  hour,
  minute,
  onBumpHour,
  onBumpMinute,
}: {
  hour: number;
  minute: number;
  onBumpHour: (d: number) => void;
  onBumpMinute: (d: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-lg font-bold tabular-nums text-pink-600">
        {pad2(hour)}:{pad2(minute)}
      </p>
      <div
        dir="ltr"
        className="flex items-center gap-3 rounded-2xl border border-pink-100 bg-white px-4 py-3"
      >
        <TimeColumn
          value={pad2(hour)}
          label="ساعت"
          onInc={() => onBumpHour(1)}
          onDec={() => onBumpHour(-1)}
        />
        <span className="pb-5 text-2xl font-bold text-zinc-300">:</span>
        <TimeColumn
          value={pad2(minute)}
          label="دقیقه"
          onInc={() => onBumpMinute(1)}
          onDec={() => onBumpMinute(-1)}
        />
      </div>
    </div>
  );
}

function defaultSelectedIds(options: OptionItem[]): number[] {
  return options.slice(0, MAX_INVITE_OPTIONS).map((o) => o.id);
}

function bumpClock(
  hour: number,
  minute: number,
  deltaHour: number,
  deltaMinSteps: number
): { hour: number; minute: number } {
  let h = hour;
  let m = minute;
  if (deltaHour) h = (h + deltaHour + 24) % 24;
  if (deltaMinSteps) {
    const next = m + deltaMinSteps * 5;
    if (next >= 60) {
      m = 0;
      h = (h + 1) % 24;
    } else if (next < 0) {
      m = 55;
      h = (h + 23) % 24;
    } else {
      m = next;
    }
  }
  return { hour: h, minute: m };
}

export default function CreateInvite({
  activeOptions,
}: {
  activeOptions: OptionItem[];
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [inviteText, setInviteText] = useState("");

  const [dateFrom, setDateFrom] = useState("");
  const [dateFromLabel, setDateFromLabel] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateToLabel, setDateToLabel] = useState("");

  const [useTimeWindow, setUseTimeWindow] = useState(false);
  const [fromHour, setFromHour] = useState(10);
  const [fromMinute, setFromMinute] = useState(0);
  const [toHour, setToHour] = useState(22);
  const [toMinute, setToMinute] = useState(0);

  const [expiryDate, setExpiryDate] = useState("");
  const [expiryDateLabel, setExpiryDateLabel] = useState("");
  const [hour, setHour] = useState(23);
  const [minute, setMinute] = useState(55);

  const [selectedIds, setSelectedIds] = useState<number[]>(() =>
    defaultSelectedIds(activeOptions)
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ token: string; url: string } | null>(
    null
  );
  const [error, setError] = useState("");
  const router = useRouter();

  const selectedCount = selectedIds.length;
  const optionsValid =
    selectedCount >= MIN_INVITE_OPTIONS &&
    selectedCount <= MAX_INVITE_OPTIONS;

  const errorFa = useMemo(
    () =>
      ({
        invalid_option_count: `بین ${MIN_INVITE_OPTIONS} تا ${MAX_INVITE_OPTIONS} گزینه انتخاب کن`,
        invalid_options: "یکی از گزینه‌ها معتبر نیست",
        invalid_expiry: "تاریخ انقضا درست نیست",
        incomplete_date_window: "هر دو تاریخ از و تا رو پر کن",
        incomplete_time_window: "هر دو ساعت از و تا رو پر کن",
        invalid_date_window: "بازه تاریخ درست نیست",
        invalid_time_window: "بازه ساعت درست نیست (از ≤ تا)",
        invalid_window: "بازه تاریخ/ساعت درست نیست",
      }) as Record<string, string>,
    []
  );

  const clearDateWindow = () => {
    setDateFrom("");
    setDateFromLabel("");
    setDateTo("");
    setDateToLabel("");
  };

  const clearExpiry = () => {
    setExpiryDate("");
    setExpiryDateLabel("");
    setHour(23);
    setMinute(55);
  };

  const resetWindows = () => {
    clearDateWindow();
    setUseTimeWindow(false);
    setFromHour(10);
    setFromMinute(0);
    setToHour(22);
    setToMinute(0);
    clearExpiry();
  };

  const toggleOption = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_INVITE_OPTIONS) return prev;
      return [...prev, id];
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !optionsValid) return;
    setLoading(true);
    setError("");

    if ((dateFrom && !dateTo) || (!dateFrom && dateTo)) {
      setLoading(false);
      setError(errorFa.incomplete_date_window);
      return;
    }
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setLoading(false);
      setError(errorFa.invalid_date_window);
      return;
    }

    let timeFrom: string | null = null;
    let timeTo: string | null = null;
    if (useTimeWindow) {
      timeFrom = `${pad2(fromHour)}:${pad2(fromMinute)}`;
      timeTo = `${pad2(toHour)}:${pad2(toMinute)}`;
      if (timeFrom > timeTo) {
        setLoading(false);
        setError(errorFa.invalid_time_window);
        return;
      }
    }

    let expiresAt: string | null = null;
    if (expiryDate) {
      const built = buildSelectedDatetime(
        expiryDate,
        `${pad2(hour)}:${pad2(minute)}`
      );
      if (!built) {
        setLoading(false);
        setError("تاریخ یا ساعت انقضا درست نیست");
        return;
      }
      expiresAt = built;
    }

    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: name.trim(),
          inviteText: inviteText.trim() || DEFAULT_INVITE_TEXT,
          expiresAt,
          optionIds: selectedIds,
          dateFrom: dateFrom || null,
          dateTo: dateTo || null,
          timeFrom,
          timeTo,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setResult(data);
        setName("");
        setInviteText("");
        resetWindows();
        setSelectedIds(defaultSelectedIds(activeOptions));
        router.refresh();
      } else {
        setError(errorFa[data.error] || data.error || "خطایی رخ داد");
      }
    } catch {
      setLoading(false);
      setError("ارتباط با سرور برقرار نشد");
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-2xl border-2 border-dashed border-zinc-300 px-6 py-4 text-zinc-500 transition hover:border-pink-400 hover:text-pink-600"
      >
        + ساخت دعوت‌نامه جدید
      </button>
    );
  }

  const datePickerClass =
    "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-center outline-none focus:border-pink-500";

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-zinc-100 space-y-4">
      <p className="font-bold">دعوت‌نامه جدید</p>
      <form onSubmit={handleCreate} className="flex flex-col gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسم مهمون"
          className="rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 outline-none focus:border-pink-500"
          autoFocus
          maxLength={100}
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-400">متن دعوت (اختیاری)</label>
          <input
            type="text"
            value={inviteText}
            onChange={(e) => setInviteText(e.target.value)}
            placeholder={DEFAULT_INVITE_TEXT}
            className="rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 outline-none focus:border-pink-500"
            maxLength={200}
          />
          {name.trim() && (
            <p className="text-xs text-zinc-400 pt-1">
              پیش‌نمایش: {name.trim()}،{" "}
              {inviteText.trim() || DEFAULT_INVITE_TEXT}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <div className="flex items-center justify-between">
            <label className="text-xs text-zinc-400">
              گزینه‌ها ({MIN_INVITE_OPTIONS} تا {MAX_INVITE_OPTIONS})
            </label>
            <span
              className={`text-xs ${optionsValid ? "text-zinc-400" : "text-red-500"}`}
            >
              {selectedCount} انتخاب‌شده
            </span>
          </div>
          {activeOptions.length === 0 ? (
            <p className="text-sm text-red-500 text-center py-2">
              اول از «مدیریت گزینه‌ها» حداقل {MIN_INVITE_OPTIONS} تا بساز
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {activeOptions.map((opt) => {
                const checked = selectedIds.includes(opt.id);
                const disabled =
                  !checked && selectedIds.length >= MAX_INVITE_OPTIONS;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleOption(opt.id)}
                    className={`rounded-xl border-2 px-3 py-3 text-sm font-medium transition disabled:opacity-40 ${
                      checked
                        ? "border-pink-500 bg-pink-50"
                        : "border-zinc-200 bg-white"
                    }`}
                  >
                    <span className="text-xl block mb-0.5">{opt.emoji}</span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <div className="flex items-center justify-between">
            <label className="text-xs text-zinc-400">بازه تاریخ انتخاب (اختیاری)</label>
            {(dateFrom || dateTo) && (
              <button
                type="button"
                onClick={clearDateWindow}
                className="text-xs text-pink-600 hover:underline"
              >
                پاک کردن
              </button>
            )}
          </div>
          <DatePicker
            calendar={persian}
            locale={persianFa}
            value={dateFromLabel || undefined}
            editable={false}
            calendarPosition="bottom-center"
            inputClass={datePickerClass}
            containerClassName="w-full"
            placeholder="از تاریخ"
            onChange={(value) => {
              if (!value || Array.isArray(value)) {
                setDateFrom("");
                setDateFromLabel("");
                return;
              }
              const label = value.format("YYYY/MM/DD");
              const iso = toAsciiDigits(
                value.convert(gregorian).format("YYYY-MM-DD")
              );
              setDateFromLabel(label);
              setDateFrom(iso);
              if (dateTo && iso > dateTo) {
                setDateTo("");
                setDateToLabel("");
              }
            }}
          />
          <DatePicker
            calendar={persian}
            locale={persianFa}
            value={dateToLabel || undefined}
            editable={false}
            calendarPosition="bottom-center"
            inputClass={datePickerClass}
            containerClassName="w-full"
            placeholder="تا تاریخ"
            minDate={dateFromLabel || undefined}
            onChange={(value) => {
              if (!value || Array.isArray(value)) {
                setDateTo("");
                setDateToLabel("");
                return;
              }
              setDateToLabel(value.format("YYYY/MM/DD"));
              setDateTo(
                toAsciiDigits(value.convert(gregorian).format("YYYY-MM-DD"))
              );
            }}
          />
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <label className="flex items-center gap-2 text-xs text-zinc-500">
            <input
              type="checkbox"
              checked={useTimeWindow}
              onChange={(e) => setUseTimeWindow(e.target.checked)}
            />
            محدود کردن بازه ساعت
          </label>
          {useTimeWindow && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-zinc-400 text-center">از ساعت</p>
                <TimeStepper
                  hour={fromHour}
                  minute={fromMinute}
                  onBumpHour={(d) => {
                    const next = bumpClock(fromHour, fromMinute, d, 0);
                    setFromHour(next.hour);
                    setFromMinute(next.minute);
                  }}
                  onBumpMinute={(d) => {
                    const next = bumpClock(fromHour, fromMinute, 0, d);
                    setFromHour(next.hour);
                    setFromMinute(next.minute);
                  }}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-zinc-400 text-center">تا ساعت</p>
                <TimeStepper
                  hour={toHour}
                  minute={toMinute}
                  onBumpHour={(d) => {
                    const next = bumpClock(toHour, toMinute, d, 0);
                    setToHour(next.hour);
                    setToMinute(next.minute);
                  }}
                  onBumpMinute={(d) => {
                    const next = bumpClock(toHour, toMinute, 0, d);
                    setToHour(next.hour);
                    setToMinute(next.minute);
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <div className="flex items-center justify-between">
            <label className="text-xs text-zinc-400">انقضای لینک (اختیاری)</label>
            {expiryDate && (
              <button
                type="button"
                onClick={clearExpiry}
                className="text-xs text-pink-600 hover:underline"
              >
                پاک کردن
              </button>
            )}
          </div>

          <DatePicker
            calendar={persian}
            locale={persianFa}
            value={expiryDateLabel || undefined}
            editable={false}
            calendarPosition="bottom-center"
            inputClass={datePickerClass}
            containerClassName="w-full"
            placeholder="تاریخ انقضا"
            onChange={(value) => {
              if (!value || Array.isArray(value)) {
                setExpiryDate("");
                setExpiryDateLabel("");
                return;
              }
              setExpiryDateLabel(value.format("YYYY/MM/DD"));
              setExpiryDate(
                toAsciiDigits(value.convert(gregorian).format("YYYY-MM-DD"))
              );
            }}
          />

          {expiryDate && (
            <TimeStepper
              hour={hour}
              minute={minute}
              onBumpHour={(d) => {
                const next = bumpClock(hour, minute, d, 0);
                setHour(next.hour);
                setMinute(next.minute);
              }}
              onBumpMinute={(d) => {
                const next = bumpClock(hour, minute, 0, d);
                setHour(next.hour);
                setMinute(next.minute);
              }}
            />
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading || !name.trim() || !optionsValid}
            className="flex-1 rounded-full bg-pink-500 px-6 py-3 text-white font-bold transition hover:bg-pink-600 disabled:opacity-40"
          >
            {loading ? "..." : "بساز"}
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setResult(null);
            }}
            className="rounded-full bg-zinc-200 px-6 py-3 font-bold transition hover:bg-zinc-300"
          >
            بستن
          </button>
        </div>
      </form>

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      {result && (
        <div className="rounded-xl bg-pink-50 p-4 space-y-2">
          <p className="text-sm font-bold text-pink-700">✓ ساخته شد!</p>
          <input
            readOnly
            value={result.url}
            className="w-full rounded-xl border border-pink-200 bg-white px-3 py-2 text-sm outline-none"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
        </div>
      )}
    </div>
  );
}
