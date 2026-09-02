"use client";

import { useState } from "react";

type Props = {
  mode: "login" | "signup";
};

export default function AuthForm({ mode }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (mode === "signup" && password !== confirm) {
      setError("رمز عبور و تکرارش یکی نیستن");
      return;
    }

    if (password.length < 8) {
      setError("رمز عبور باید حداقل ۸ کاراکتر باشه");
      return;
    }

    setLoading(true);

    // Auth API ships in v2 step 9-2+
    await new Promise((r) => setTimeout(r, 400));
    setInfo("ثبت‌نام و ورود به‌زودی فعال می‌شه. لطفاً کمی بعد دوباره سر بزن.");
    setLoading(false);
  };

  const inputClass =
    "w-full rounded-2xl border border-zinc-300 bg-white px-6 py-4 text-center text-lg outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200";

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 text-right">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ایمیل"
        required
        autoComplete="email"
        className={inputClass}
        dir="ltr"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="رمز عبور"
        required
        minLength={8}
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        className={inputClass}
        dir="ltr"
      />
      {mode === "signup" && (
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="تکرار رمز عبور"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
          dir="ltr"
        />
      )}
      {error && <p className="text-center text-sm text-red-500">{error}</p>}
      {info && (
        <p className="rounded-2xl bg-pink-50 px-4 py-3 text-center text-sm text-pink-700">
          {info}
        </p>
      )}
      <button
        type="submit"
        disabled={loading || !email || !password}
        className="rounded-full bg-pink-500 px-8 py-4 text-lg font-bold text-white transition hover:bg-pink-600 disabled:opacity-40"
      >
        {loading ? "..." : mode === "login" ? "ورود" : "ثبت‌نام"}
      </button>
    </form>
  );
}
