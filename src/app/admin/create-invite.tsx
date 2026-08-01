"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";
import { DEFAULT_INVITE_TEXT } from "@/lib/invite-defaults";
import { buildSelectedDatetime, toAsciiDigits } from "@/lib/datetime";

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

export default function CreateInvite({ appUrl }: { appUrl: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [inviteText, setInviteText] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [expiryDateLabel, setExpiryDateLabel] = useState("");
  const [hour, setHour] = useState(23);
  const [minute, setMinute] = useState(55);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ token: string; url: string } | null>(
    null
  );
  const [error, setError] = useState("");
  const router = useRouter();

  const bumpHour = (delta: number) => {
    setHour((h) => (h + delta + 24) % 24);
  };

  const bumpMinute = (delta: number) => {
    const next = minute + delta * 5;
    if (next >= 60) {
      setMinute(0);
      setHour((h) => (h + 1) % 24);
      return;
    }
    if (next < 0) {
      setMinute(55);
      setHour((h) => (h + 23) % 24);
      return;
    }
    setMinute(next);
  };

  const clearExpiry = () => {
    setExpiryDate("");
    setExpiryDateLabel("");
    setHour(23);
    setMinute(55);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");

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
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setResult(data);
        setName("");
        setInviteText("");
        clearExpiry();
        router.refresh();
      } else {
        setError(data.error || "خطایی رخ داد");
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

        <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <div className="flex items-center justify-between">
            <label className="text-xs text-zinc-400">انقضا (اختیاری)</label>
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
            inputClass="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-center outline-none focus:border-pink-500"
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
            <div className="flex flex-col items-center gap-2">
              <p className="text-lg font-bold tabular-nums text-pink-600">
                {pad2(hour)}:{pad2(minute)}
              </p>
              <div className="flex items-center gap-3 rounded-2xl border border-pink-100 bg-white px-4 py-3">
                <TimeColumn
                  value={pad2(hour)}
                  label="ساعت"
                  onInc={() => bumpHour(1)}
                  onDec={() => bumpHour(-1)}
                />
                <span className="pb-5 text-2xl font-bold text-zinc-300">:</span>
                <TimeColumn
                  value={pad2(minute)}
                  label="دقیقه"
                  onInc={() => bumpMinute(1)}
                  onDec={() => bumpMinute(-1)}
                />
              </div>
              <p className="text-[11px] text-zinc-400">
                {expiryDateLabel} — {pad2(hour)}:{pad2(minute)}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading || !name.trim()}
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
