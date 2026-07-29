"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setError("رمز اشتباهه");
      setLoading(false);
      return;
    }

    router.refresh();
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 min-h-screen">
      <p className="text-4xl">🔒</p>
      <p className="text-xl font-bold">پنل مدیریت</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="رمز عبور"
          className="rounded-2xl border border-zinc-300 bg-white px-6 py-4 text-center text-lg outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
          autoFocus
        />
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="rounded-full bg-pink-500 px-8 py-4 text-lg font-bold text-white transition hover:bg-pink-600 disabled:opacity-40"
        >
          {loading ? "..." : "ورود"}
        </button>
      </form>
    </main>
  );
}
