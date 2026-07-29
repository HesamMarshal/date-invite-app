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
      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:shadow-emerald-500/30"
      : "bg-zinc-200 text-zinc-800 hover:bg-zinc-300";
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

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
            {name}، با من سر قرار میای؟
          </h1>
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <Btn onClick={() => setStep("date")}>💚 بله</Btn>
            <Btn variant="secondary" onClick={handleNo}>
              🤍 نه
            </Btn>
          </div>
        </div>
      )}

      {/* ───── Soft no 1 ───── */}
      {step === "soft-no-1" && (
        <div className="flex flex-col items-center gap-8 animate-fade-in">
          <span className="text-7xl animate-float">🥺</span>
          <h1 className="text-2xl font-bold">مطمئنی؟</h1>
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <Btn onClick={() => setStep("date")}>🤔 بذار دوباره فکر کنم</Btn>
            <Btn variant="secondary" onClick={handleNo}>
              😅 آره مطمئنم
            </Btn>
          </div>
        </div>
      )}

      {/* ───── Soft no 2 (final) ───── */}
      {step === "soft-no-2" && (
        <div className="flex flex-col items-center gap-8 animate-fade-in">
          <span className="text-7xl animate-float">😢</span>
          <h1 className="text-2xl font-bold">قول میدم خوش بگذره!</h1>
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <Btn onClick={() => setStep("date")}>💚 باشه بله!</Btn>
            <Btn variant="secondary" onClick={() => submit(false)}>
              🙈 واقعاً نه
            </Btn>
          </div>
        </div>
      )}

      {/* ───── Date ───── */}
      {step === "date" && (
        <div className="flex flex-col items-center gap-8 animate-fade-in">
          <span className="text-6xl">📅</span>
          <h1 className="text-2xl font-bold">چه روزی؟</h1>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full max-w-xs rounded-2xl border border-zinc-300 bg-white px-6 py-4 text-center text-lg outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
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
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full max-w-xs rounded-2xl border border-zinc-300 bg-white px-6 py-4 text-center text-lg outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
          <Btn onClick={() => time && setStep("food")} disabled={!time}>
            بعدی ←
          </Btn>
        </div>
      )}

      {/* ───── Food ───── */}
      {step === "food" && (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <span className="text-6xl">🍽️</span>
          <h1 className="text-2xl font-bold">چی دوست داری؟</h1>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {FOOD_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setFood(opt.label)}
                className={`rounded-2xl border-2 px-4 py-5 text-base font-medium transition-all duration-200 active:scale-[0.97] select-none ${
                  food === opt.label
                    ? "border-emerald-500 bg-emerald-50 shadow-sm shadow-emerald-500/10"
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
              {FOOD_OPTIONS.find((o) => o.label === food)?.emoji} {food}
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
