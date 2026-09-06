"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserPlanSelect({
  userId,
  planTier,
  planSlugs,
}: {
  userId: number;
  planTier: string;
  planSlugs: string[];
}) {
  const [value, setValue] = useState(planTier);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onChange = async (next: string) => {
    if (next === value) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_tier: next }),
      });
      if (res.ok) {
        setValue(next);
        router.refresh();
      } else {
        alert("ذخیره نشد");
      }
    } catch {
      alert("ارتباط برقرار نشد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={value}
      disabled={loading}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs"
      dir="ltr"
    >
      {planSlugs.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
      {!planSlugs.includes(value) ? (
        <option value={value}>{value}</option>
      ) : null}
    </select>
  );
}
