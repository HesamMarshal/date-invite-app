"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InviteActiveToggle({
  id,
  isActive,
  maxActive,
}: {
  id: number;
  isActive: boolean;
  maxActive?: number;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const toggle = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/invites/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.refresh();
      } else if (data.error === "limit_active") {
        setError(
          maxActive != null
            ? `حداکثر ${maxActive} دعوت فعال — یکی رو غیرفعال کن`
            : "به سقف دعوت فعال رسیدی — یکی رو غیرفعال کن"
        );
      } else if (data.error === "unauthorized") {
        setError("اول وارد شو");
      } else {
        setError("انجام نشد. دوباره امتحان کن");
      }
    } catch {
      setError("ارتباط با سرور برقرار نشد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        className={`w-full rounded-xl px-3 py-2 text-sm font-medium transition disabled:opacity-40 ${
          isActive
            ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            : "bg-pink-50 text-pink-700 hover:bg-pink-100"
        }`}
      >
        {loading
          ? "..."
          : isActive
            ? "⏸ غیرفعال کردن لینک"
            : "▶ فعال کردن لینک"}
      </button>
      {error && (
        <p className="text-center text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
