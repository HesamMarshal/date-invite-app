"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteInviteButton({
  id,
  name,
}: {
  id: number;
  name: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`دعوت‌نامه «${name}» حذف بشه؟`)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("حذف نشد. دوباره امتحان کن.");
      }
    } catch {
      alert("ارتباط با سرور برقرار نشد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      title="حذف دعوت‌نامه"
      aria-label={`حذف دعوت‌نامه ${name}`}
      className="rounded-xl bg-red-50 px-3 py-2 text-base transition hover:bg-red-100 disabled:opacity-40"
    >
      {loading ? "…" : "🗑️"}
    </button>
  );
}
