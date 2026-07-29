"use client";

import { useState, useCallback } from "react";
import { FOOD_OPTIONS, type FoodChoice } from "@/lib/food-options";

type Existing = {
  accepted: boolean;
  selectedDatetime: string | null;
  foodChoice: string | null;
};

type Props = {
  token: string;
  name: string;
  existing: Existing | null;
};

type Step =
  | "ask"
  | "soft-no-1"
  | "soft-no-2"
  | "date"
  | "time"
  | "food"
  | "submitting"
  | "thanks"
  | "goodbye"
  | "current";

export default function InviteFlow({ token, name, existing }: Props) {
  const [step, setStep] = useState<Step>(existing ? "current" : "ask");
  const [noCount, setNoCount] = useState(0);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [food, setFood] = useState<FoodChoice | "">("");
  const [error, setError] = useState("");

  const submit = useCallback(
    async (accepted: boolean) => {
      setStep("submitting");
      setError("");

      const selectedDatetime =
        accepted && date && time ? `${date}T${time}:00` : null;

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
        setError(data.error || "خطایی رخ داد");
        setStep(accepted ? "food" : "ask");
        return;
      }

      setStep(accepted ? "thanks" : "goodbye");
    },
    [token, date, time, food]
  );

  const handleNo = () => {
    if (noCount === 0) {
      setNoCount(1);
      setStep("soft-no-1");
    } else {
      setNoCount(2);
      setStep("soft-no-2");
    }
  };

  const wantToChange = () => {
    setStep("ask");
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center min-h-screen">
      {/* ───── Current response (revisit) ───── */}
      {step === "current" && existing && (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <p className="text-5xl">{existing.accepted ? "✅" : "❌"}</p>
          <p className="text-xl font-bold">
            {existing.accepted
              ? `${name}، قبلاً جواب دادی!`
              : `${name}، قبلاً رد کردی`}
          </p>
          {existing.accepted && existing.selectedDatetime && (
            <div className="text-zinc-600 space-y-1">
              <p>
                📅{" "}
                {new Date(existing.selectedDatetime).toLocaleDateString("fa-IR")}
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
          <button
            onClick={wantToChange}
            className="mt-4 rounded-full bg-zinc-200 px-6 py-3 text-sm transition hover:bg-zinc-300"
          >
            می‌خوام عوض کنم
          </button>
        </div>
      )}

      {/* ───── Ask ───── */}
      {step === "ask" && (
        <div className="flex flex-col items-center gap-8 animate-fade-in">
          <p className="text-6xl">👤</p>
          <p className="text-2xl font-bold leading-relaxed">
            {name}، با من سر قرار میای؟
          </p>
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button
              onClick={() => setStep("date")}
              className="rounded-full bg-emerald-500 px-8 py-4 text-lg font-bold text-white transition hover:bg-emerald-600 active:scale-95"
            >
              💚 بله
            </button>
            <button
              onClick={handleNo}
              className="rounded-full bg-zinc-200 px-8 py-4 text-lg font-bold transition hover:bg-zinc-300 active:scale-95"
            >
              🤍 نه
            </button>
          </div>
        </div>
      )}

      {/* ───── Soft no 1 ───── */}
      {step === "soft-no-1" && (
        <div className="flex flex-col items-center gap-8 animate-fade-in">
          <p className="text-6xl">🥺</p>
          <p className="text-2xl font-bold">مطمئنی؟</p>
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button
              onClick={() => setStep("date")}
              className="rounded-full bg-emerald-500 px-8 py-4 text-lg font-bold text-white transition hover:bg-emerald-600 active:scale-95"
            >
              🤔 بذار دوباره فکر کنم
            </button>
            <button
              onClick={handleNo}
              className="rounded-full bg-zinc-200 px-8 py-4 text-lg font-bold transition hover:bg-zinc-300 active:scale-95"
            >
              😅 آره مطمئنم
            </button>
          </div>
        </div>
      )}

      {/* ───── Soft no 2 (final) ───── */}
      {step === "soft-no-2" && (
        <div className="flex flex-col items-center gap-8 animate-fade-in">
          <p className="text-6xl">😢</p>
          <p className="text-2xl font-bold">قول میدم خوش بگذره!</p>
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button
              onClick={() => setStep("date")}
              className="rounded-full bg-emerald-500 px-8 py-4 text-lg font-bold text-white transition hover:bg-emerald-600 active:scale-95"
            >
              💚 باشه بله!
            </button>
            <button
              onClick={() => submit(false)}
              className="rounded-full bg-zinc-200 px-8 py-4 text-lg font-bold transition hover:bg-zinc-300 active:scale-95"
            >
              🙈 واقعاً نه
            </button>
          </div>
        </div>
      )}

      {/* ───── Date ───── */}
      {step === "date" && (
        <div className="flex flex-col items-center gap-8 animate-fade-in">
          <p className="text-5xl">📅</p>
          <p className="text-2xl font-bold">چه روزی؟</p>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full max-w-xs rounded-2xl border border-zinc-300 bg-white px-6 py-4 text-center text-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
          <button
            onClick={() => {
              if (!date) return;
              setStep("time");
            }}
            disabled={!date}
            className="rounded-full bg-emerald-500 px-8 py-4 text-lg font-bold text-white transition hover:bg-emerald-600 disabled:opacity-40 active:scale-95"
          >
            بعدی ←
          </button>
        </div>
      )}

      {/* ───── Time ───── */}
      {step === "time" && (
        <div className="flex flex-col items-center gap-8 animate-fade-in">
          <p className="text-5xl">🕐</p>
          <p className="text-2xl font-bold">چه ساعتی؟</p>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full max-w-xs rounded-2xl border border-zinc-300 bg-white px-6 py-4 text-center text-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
          <button
            onClick={() => {
              if (!time) return;
              setStep("food");
            }}
            disabled={!time}
            className="rounded-full bg-emerald-500 px-8 py-4 text-lg font-bold text-white transition hover:bg-emerald-600 disabled:opacity-40 active:scale-95"
          >
            بعدی ←
          </button>
        </div>
      )}

      {/* ───── Food ───── */}
      {step === "food" && (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <p className="text-5xl">🍽️</p>
          <p className="text-2xl font-bold">چی دوست داری؟</p>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {FOOD_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setFood(opt.label)}
                className={`rounded-2xl border-2 px-4 py-4 text-base font-medium transition active:scale-95 ${
                  food === opt.label
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <br />
                {opt.label}
              </button>
            ))}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            onClick={() => submit(true)}
            disabled={!food}
            className="rounded-full bg-emerald-500 px-8 py-4 text-lg font-bold text-white transition hover:bg-emerald-600 disabled:opacity-40 active:scale-95"
          >
            ثبت قرار ✓
          </button>
        </div>
      )}

      {/* ───── Submitting ───── */}
      {step === "submitting" && (
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <p className="text-5xl animate-bounce">⏳</p>
          <p className="text-lg text-zinc-500">در حال ثبت...</p>
        </div>
      )}

      {/* ───── Thanks ───── */}
      {step === "thanks" && (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <p className="text-6xl">🎉</p>
          <p className="text-2xl font-bold">ممنون ❤️</p>
          <p className="text-lg text-zinc-600">قرارمون ثبت شد!</p>
          <div className="mt-2 rounded-2xl bg-white p-6 shadow-sm space-y-2 text-zinc-700">
            <p>
              📅{" "}
              {new Date(date + "T" + time).toLocaleDateString("fa-IR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p>
              🕐{" "}
              {new Date(date + "T" + time).toLocaleTimeString("fa-IR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p>
              🍽️ {FOOD_OPTIONS.find((o) => o.label === food)?.emoji} {food}
            </p>
          </div>
          <p className="text-sm text-zinc-400 mt-4">
            منتظر دیدنت هستم 😊
          </p>
        </div>
      )}

      {/* ───── Goodbye ───── */}
      {step === "goodbye" && (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <p className="text-6xl">😔</p>
          <p className="text-2xl font-bold">باشه...</p>
          <p className="text-lg text-zinc-600">
            ولی اگه نظرت عوض شد
            <br />
            همین لینک همیشه فعاله ❤️
          </p>
        </div>
      )}
    </main>
  );
}
