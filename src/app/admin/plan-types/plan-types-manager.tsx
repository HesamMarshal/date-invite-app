"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PlanLimits } from "@/lib/plan-limits";
import { formatPlanCapFa, isValidPlanCap } from "@/lib/plan-cap";

export default function PlanTypesManager({
  initialPlans,
}: {
  initialPlans: PlanLimits[];
}) {
  const [plans, setPlans] = useState(initialPlans);
  const [slug, setSlug] = useState("");
  const [maxActive, setMaxActive] = useState("3");
  const [maxMonthly, setMaxMonthly] = useState("5");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editActive, setEditActive] = useState("1");
  const [editMonthly, setEditMonthly] = useState("1");
  const router = useRouter();

  const refresh = () => router.refresh();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const s = slug.trim().toLowerCase();
    const a = Number(maxActive);
    const m = Number(maxMonthly);
    if (!s || !isValidPlanCap(a) || !isValidPlanCap(m)) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/plan-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: s,
          max_active: a,
          max_monthly_creates: m,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(
          data.error === "duplicate_or_failed"
            ? "این slug تکراریه"
            : data.error === "invalid_slug"
              ? "slug فقط حروف کوچک و عدد و _ (با حرف شروع بشه)"
              : data.error || "خطا"
        );
        return;
      }
      setSlug("");
      setMaxActive("3");
      setMaxMonthly("5");
      setPlans((prev) =>
        [...prev, data.plan as PlanLimits].sort((x, y) =>
          x.slug.localeCompare(y.slug)
        )
      );
      refresh();
    } catch {
      setLoading(false);
      setError("ارتباط برقرار نشد");
    }
  };

  const startEdit = (p: PlanLimits) => {
    setEditingSlug(p.slug);
    setEditActive(String(p.max_active));
    setEditMonthly(String(p.max_monthly_creates));
    setError("");
  };

  const saveEdit = async () => {
    if (!editingSlug) return;
    const a = Number(editActive);
    const m = Number(editMonthly);
    if (!isValidPlanCap(a) || !isValidPlanCap(m)) {
      setError("عدد ≥ ۱، یا ۱- برای بدون سقف");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/plan-types/${encodeURIComponent(editingSlug)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            max_active: a,
            max_monthly_creates: m,
          }),
        }
      );
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error || "ذخیره نشد");
        return;
      }
      setPlans((prev) =>
        prev.map((p) => (p.slug === editingSlug ? (data.plan as PlanLimits) : p))
      );
      setEditingSlug(null);
      refresh();
    } catch {
      setLoading(false);
      setError("ارتباط برقرار نشد");
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="space-y-3 rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm"
      >
        <p className="font-bold">پلن جدید</p>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="slug (مثل free یا vip)"
          className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-pink-500"
          maxLength={32}
          dir="ltr"
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-zinc-400">حداکثر فعال</label>
            <input
              type="number"
              min={-1}
              value={maxActive}
              onChange={(e) => setMaxActive(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-pink-500"
              dir="ltr"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">
              حداکثر ساخت ماهانه
            </label>
            <input
              type="number"
              min={-1}
              value={maxMonthly}
              onChange={(e) => setMaxMonthly(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-pink-500"
              dir="ltr"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || !slug.trim()}
          className="w-full rounded-full bg-pink-500 px-6 py-3 font-bold text-white transition hover:bg-pink-600 disabled:opacity-40"
        >
          {loading ? "..." : "افزودن"}
        </button>
      </form>

      {error && (
        <p className="text-center text-sm text-red-500">{error}</p>
      )}

      <div className="flex flex-col gap-3">
        {plans.map((p) => (
          <div
            key={p.slug}
            className="space-y-3 rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm"
          >
            {editingSlug === p.slug ? (
              <>
                <p className="font-bold" dir="ltr">
                  {p.slug}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-zinc-400">
                      حداکثر فعال
                    </label>
                    <input
                      type="number"
                      min={-1}
                      value={editActive}
                      onChange={(e) => setEditActive(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-pink-500"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-zinc-400">
                      حداکثر ساخت ماهانه
                    </label>
                    <input
                      type="number"
                      min={-1}
                      value={editMonthly}
                      onChange={(e) => setEditMonthly(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-pink-500"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={saveEdit}
                    disabled={loading}
                    className="flex-1 rounded-full bg-pink-500 py-2 text-sm font-bold text-white disabled:opacity-40"
                  >
                    ذخیره
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingSlug(null)}
                    className="rounded-full bg-zinc-200 px-4 py-2 text-sm font-bold"
                  >
                    انصراف
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold" dir="ltr">
                    {p.slug}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {formatPlanCapFa(p.max_active)} فعال ·{" "}
                    {formatPlanCapFa(p.max_monthly_creates)} ساخت / ماه
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(p)}
                  className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium hover:bg-zinc-200"
                >
                  ویرایش
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-zinc-400">
        حذف پلن نداریم (کاربرها به slug وصلن). برای اختصاص به کاربر:{" "}
        <span dir="ltr">UPDATE users SET plan_tier = &apos;…&apos;</span>
      </p>
    </div>
  );
}
