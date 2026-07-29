"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateInvite({ appUrl }: { appUrl: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ token: string; url: string } | null>(
    null
  );
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: name.trim(),
          expiresAt: expiresAt || null,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setResult(data);
        setName("");
        setExpiresAt("");
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
        className="rounded-2xl border-2 border-dashed border-zinc-300 px-6 py-4 text-zinc-500 transition hover:border-emerald-400 hover:text-emerald-600"
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
          className="rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 outline-none focus:border-emerald-500"
          autoFocus
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-400">تاریخ انقضا (اختیاری)</label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex-1 rounded-full bg-emerald-500 px-6 py-3 text-white font-bold transition hover:bg-emerald-600 disabled:opacity-40"
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
        <div className="rounded-xl bg-emerald-50 p-4 space-y-2">
          <p className="text-sm font-bold text-emerald-700">✓ ساخته شد!</p>
          <input
            readOnly
            value={result.url}
            className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm outline-none"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
        </div>
      )}
    </div>
  );
}
