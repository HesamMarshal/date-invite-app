"use client";

import { useState, useCallback } from "react";
import { API_ERROR_FA, buildSelectedDatetime, toAsciiDigits } from "@/lib/datetime";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";

type FoodOption = { id: number; emoji: string; label: string };

type Existing = {
  accepted: boolean;
  selectedDatetime: string | null;
  foodChoice: string | null;
};

type Props = {
  token: string;
  name: string;
  inviteText: string;
  foodOptions: FoodOption[];
  existing: Existing | null;
};

type Step =
  | "ask"
  | "date"
  | "time"
  | "food"
  | "submitting"
  | "thanks"
  | "goodbye"
  | "current";

function Btn({
  children,
  variant = "primary",
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  onClick?: () => void;
}) {
  const base =
    "w-full max-w-xs rounded-full px-8 py-4 text-lg font-bold transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100 select-none";
  const styles =
    variant === "primary"
      ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20 hover:bg-pink-600 hover:shadow-pink-500/30"
      : "bg-zinc-200 text-zinc-800 hover:bg-zinc-300";
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function roundMinuteToStep(minute: number, step = 5) {
  const rounded = Math.round(minute / step) * step;
  return rounded >= 60 ? 60 - step : rounded;
}

function formatTime(hour: number, minute: number) {
  return `${pad2(hour)}:${pad2(minute)}`;
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
    "flex h-12 w-14 items-center justify-center rounded-xl bg-pink-50 text-pink-600 text-xl font-bold transition active:scale-95 active:bg-pink-100";
  return (
    <div className="flex flex-col items-center gap-2">
      <button type="button" aria-label={`${label} بیشتر`} onClick={onInc} className={btn}>
        ▲
      </button>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-pink-200 bg-white text-3xl font-bold tabular-nums text-zinc-900">
        {value}
      </div>
      <button type="button" aria-label={`${label} کمتر`} onClick={onDec} className={btn}>
        ▼
      </button>
      <span className="text-xs text-zinc-400">{label}</span>
    </div>
  );
}

export default function InviteFlow({
  token,
  name,
  inviteText,
  foodOptions,
  existing,
}: Props) {
  const [step, setStep] = useState<Step>(existing ? "current" : "ask");
  const [noCount, setNoCount] = useState(0);
  const [date, setDate] = useState("");
  const [dateLabel, setDateLabel] = useState("");
  const [hour, setHour] = useState(() => new Date().getHours());
  const [minute, setMinute] = useState(() =>
    roundMinuteToStep(new Date().getMinutes())
  );
  const [food, setFood] = useState("");
  const [error, setError] = useState("");
  const time = formatTime(hour, minute);
  const timeLabel = time;
  const noLabels = [
    "🤍 نه",
    "😅 نه",
    "🥺 نه",
    "🙈 نه",
  ] as const;

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

  const submit = useCallback(
    async (accepted: boolean) => {
      setStep("submitting");
      setError("");

      const selectedDatetime =
        accepted && date && time ? buildSelectedDatetime(date, time) : null;

      if (accepted && !selectedDatetime) {
        setError(API_ERROR_FA.invalid_datetime);
        setStep("food");
        return;
      }

      const res = await fetch("/api/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          accepted,
          selectedDatetime,
          foodChoice: accepted ? food : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(API_ERROR_FA[data.error as string] || data.error || "خطایی رخ داد");
        setStep(accepted ? "food" : "ask");
        return;
      }

      setStep(accepted ? "thanks" : "goodbye");
    },
    [token, date, time, food]
  );

  const handleNo = () => {
    setNoCount((count) => Math.min(count + 1, 4));
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center min-h-screen select-none">
      {/* ───── Current response (revisit) ───── */}
      {step === "current" && existing && (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <span className="text-6xl animate-float">
            {existing.accepted ? "✅" : "😔"}
          </span>
          <h1 className="text-2xl font-bold leading-relaxed">
            {existing.accepted
              ? `${name}، قبلاً جواب دادی!`
              : `${name}، قبلاً رد کردی`}
          </h1>
          {existing.accepted && existing.selectedDatetime && (
            <div className="rounded-2xl bg-white p-5 shadow-sm space-y-2 text-zinc-600 animate-scale-in">
              <p>
                📅{" "}
                {new Date(existing.selectedDatetime).toLocaleDateString("fa-IR", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p>
                🕐{" "}
                {new Date(existing.selectedDatetime).toLocaleTimeString("fa-IR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {existing.foodChoice && <p>🍽️ {existing.foodChoice}</p>}
            </div>
          )}
          <Btn variant="secondary" onClick={() => setStep("ask")}>
            می‌خوام عوض کنم
          </Btn>
        </div>
      )}

      {/* ───── Ask ───── */}
      {step === "ask" && (
        <div className="flex flex-col items-center gap-8 animate-fade-in">
          <span className="text-7xl animate-float">👤</span>
          <h1 className="text-2xl font-bold leading-relaxed">
            {name}، {inviteText}
          </h1>
          <div className="w-full max-w-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep("date")}
                className={`rounded-full bg-pink-500 text-white font-bold shadow-lg shadow-pink-500/20 transition-all duration-300 hover:bg-pink-600 active:scale-[0.97] ${
                  noCount >= 4
                    ? "w-full px-8 py-5 text-xl"
                    : noCount === 3
                      ? "flex-[1.75] px-8 py-5 text-xl"
                      : noCount === 2
                        ? "flex-[1.55] px-8 py-4 text-lg"
                        : noCount === 1
                          ? "flex-[1.3] px-7 py-4 text-lg"
                          : "flex-1 px-8 py-4 text-lg"
                }`}
              >
                {noCount >= 4 ? "💚 بلهههه" : "💚 بله"}
              </button>

              {noCount < 4 && (
                <button
                  onClick={handleNo}
                  className={`rounded-full bg-zinc-200 text-zinc-800 font-bold transition-all duration-300 hover:bg-zinc-300 active:scale-[0.97] ${
                    noCount === 3
                      ? "flex-[0.28] px-2 py-2 text-xs"
                      : noCount === 2
                        ? "flex-[0.42] px-3 py-2 text-sm"
                        : noCount === 1
                          ? "flex-[0.6] px-4 py-3 text-base"
                          : "flex-1 px-8 py-4 text-lg"
                  }`}
                >
                  {noLabels[noCount]}
                </button>
              )}
            </div>

            <p className="mt-4 min-h-6 text-sm text-zinc-400">
              {noCount === 0 && "فقط یکی رو انتخاب کن 😌"}
              {noCount === 1 && "انگار دکمه نه یه کم خجالتی شد..."}
              {noCount === 2 && "نه داره کوچیک تر میشه 😏"}
              {noCount === 3 && "فکر کنم نه کم کم داره منصرف میشه"}
              {noCount >= 4 && "دیگه فقط بله باقی موند 😎"}
            </p>
          </div>
        </div>
      )}

      {/* ───── Date ───── */}
      {step === "date" && (
        <div className="flex flex-col items-center gap-8 animate-fade-in">
          <span className="text-6xl">📅</span>
          <h1 className="text-2xl font-bold">چه روزی؟</h1>
          <DatePicker
            calendar={persian}
            locale={persianFa}
            value={dateLabel || undefined}
            editable={false}
            calendarPosition="bottom-center"
            inputClass="w-full max-w-xs rounded-2xl border border-zinc-300 bg-white px-6 py-4 text-center text-lg outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
            containerClassName="w-full max-w-xs"
            placeholder="یک تاریخ انتخاب کن"
            onChange={(value) => {
              if (!value || Array.isArray(value)) {
                setDate("");
                setDateLabel("");
                return;
              }
              setDateLabel(value.format("YYYY/MM/DD"));
              setDate(toAsciiDigits(value.convert(gregorian).format("YYYY-MM-DD")));
            }}
          />
          <Btn onClick={() => date && setStep("time")} disabled={!date}>
            بعدی ←
          </Btn>
        </div>
      )}

      {/* ───── Time ───── */}
      {step === "time" && (
        <div className="flex flex-col items-center gap-8 animate-fade-in">
          <span className="text-6xl">🕐</span>
          <h1 className="text-2xl font-bold">چه ساعتی؟</h1>
          <p className="text-4xl font-bold tabular-nums text-pink-600 tracking-wide">
            {timeLabel}
          </p>
          <div
            dir="ltr"
            className="flex items-center gap-4 rounded-3xl border border-pink-100 bg-white px-6 py-5 shadow-sm"
          >
            <TimeColumn
              value={pad2(hour)}
              label="ساعت"
              onInc={() => bumpHour(1)}
              onDec={() => bumpHour(-1)}
            />
            <span className="pb-6 text-3xl font-bold text-zinc-300">:</span>
            <TimeColumn
              value={pad2(minute)}
              label="دقیقه"
              onInc={() => bumpMinute(1)}
              onDec={() => bumpMinute(-1)}
            />
          </div>
          <Btn onClick={() => setStep("food")}>تأیید ساعت ←</Btn>
        </div>
      )}

      {/* ───── Food ───── */}
      {step === "food" && (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <span className="text-6xl">🍽️</span>
          <h1 className="text-2xl font-bold">چی دوست داری؟</h1>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {foodOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFood(opt.label)}
                className={`rounded-2xl border-2 px-4 py-5 text-base font-medium transition-all duration-200 active:scale-[0.97] select-none ${
                  food === opt.label
                    ? "border-pink-500 bg-pink-50 shadow-sm shadow-pink-500/10"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                <span className="text-3xl block mb-1">{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Btn onClick={() => submit(true)} disabled={!food}>
            ثبت قرار ✓
          </Btn>
        </div>
      )}

      {/* ───── Submitting ───── */}
      {step === "submitting" && (
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <span className="text-6xl animate-bounce">⏳</span>
          <p className="text-lg text-zinc-500">در حال ثبت...</p>
        </div>
      )}

      {/* ───── Thanks ───── */}
      {step === "thanks" && (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <span className="text-7xl animate-float">🎉</span>
          <h1 className="text-2xl font-bold">ممنون ❤️</h1>
          <p className="text-lg text-zinc-600">قرارمون ثبت شد!</p>
          <div className="rounded-2xl bg-white p-6 shadow-sm space-y-3 text-zinc-700 animate-scale-in">
            <p>📅 {dateLabel}</p>
            <p>🕐 {timeLabel}</p>
            <p>
              {foodOptions.find((o) => o.label === food)?.emoji} {food}
            </p>
          </div>
          <p className="text-sm text-zinc-400 mt-4">منتظر دیدنت هستم 😊</p>
        </div>
      )}

      {/* ───── Goodbye ───── */}
      {step === "goodbye" && (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <span className="text-7xl animate-float">😔</span>
          <h1 className="text-2xl font-bold">باشه...</h1>
          <p className="text-lg text-zinc-600 leading-relaxed">
            ولی اگه نظرت عوض شد
            <br />
            همین لینک همیشه فعاله ❤️
          </p>
        </div>
      )}
    </main>
  );
}
