"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { InviteOption } from "@/lib/option-queries";

export default function OptionsManager({
  initialOptions,
}: {
  initialOptions: InviteOption[];
}) {
  const [options, setOptions] = useState(initialOptions);
  const [emoji, setEmoji] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editEmoji, setEditEmoji] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [editSort, setEditSort] = useState(0);
  const [editActive, setEditActive] = useState(true);
  const router = useRouter();

  const refresh = () => router.refresh();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emoji.trim() || !label.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji: emoji.trim(), label: label.trim() }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(
          data.error === "duplicate_or_failed"
            ? "این برچسب تکراریه"
            : data.error || "خطا"
        );
        return;
      }
      setEmoji("");
      setLabel("");
      refresh();
      setOptions((prev) => [
        ...prev,
        {
          id: data.id,
          emoji: emoji.trim(),
          label: label.trim(),
          sort_order: prev.length + 1,
          is_active: 1,
          created_at: "",
          updated_at: "",
        },
      ]);
    } catch {
      setLoading(false);
      setError("ارتباط برقرار نشد");
    }
  };

  const startEdit = (opt: InviteOption) => {
    setEditingId(opt.id);
    setEditEmoji(opt.emoji);
    setEditLabel(opt.label);
    setEditSort(opt.sort_order);
    setEditActive(!!opt.is_active);
    setError("");
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/options/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emoji: editEmoji.trim(),
          label: editLabel.trim(),
          sortOrder: editSort,
          isActive: editActive,
        }),
      });
      setLoading(false);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          data.error === "duplicate_or_failed"
            ? "این برچسب تکراریه"
            : data.error || "خطا"
        );
        return;
      }
      setOptions((prev) =>
        prev.map((o) =>
          o.id === editingId
            ? {
                ...o,
                emoji: editEmoji.trim(),
                label: editLabel.trim(),
                sort_order: editSort,
                is_active: editActive ? 1 : 0,
              }
            : o
        )
      );
      setEditingId(null);
      refresh();
    } catch {
      setLoading(false);
      setError("ارتباط برقرار نشد");
    }
  };

  const handleDelete = async (opt: InviteOption) => {
    if (!confirm(`حذف «${opt.label}»؟`)) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/options/${opt.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      setLoading(false);
      if (!res.ok) {
        setError(data.error || "حذف نشد");
        return;
      }
      if (data.result === "deactivated") {
        setOptions((prev) =>
          prev.map((o) => (o.id === opt.id ? { ...o, is_active: 0 } : o))
        );
        alert("این گزینه توی دعوت‌نامه‌ها استفاده شده؛ غیرفعال شد.");
      } else {
        setOptions((prev) => prev.filter((o) => o.id !== opt.id));
      }
      if (editingId === opt.id) setEditingId(null);
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
        className="rounded-2xl bg-white p-5 shadow-sm border border-zinc-100 space-y-3"
      >
        <p className="font-bold">گزینه جدید</p>
        <div className="flex gap-2">
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="ایموجی"
            maxLength={16}
            className="w-20 rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-3 text-center outline-none focus:border-pink-500"
          />
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="برچسب (مثلاً قهوه)"
            maxLength={50}
            className="flex-1 rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 outline-none focus:border-pink-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !emoji.trim() || !label.trim()}
          className="w-full rounded-full bg-pink-500 px-6 py-3 text-white font-bold disabled:opacity-40"
        >
          افزودن
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <div
            key={opt.id}
            className={`rounded-2xl border p-4 space-y-3 ${
              opt.is_active
                ? "bg-white border-zinc-100"
                : "bg-zinc-50 border-zinc-200 opacity-70"
            }`}
          >
            {editingId === opt.id ? (
              <>
                <div className="flex gap-2">
                  <input
                    value={editEmoji}
                    onChange={(e) => setEditEmoji(e.target.value)}
                    className="w-20 rounded-xl border border-zinc-300 px-3 py-2 text-center"
                    maxLength={16}
                  />
                  <input
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="flex-1 rounded-xl border border-zinc-300 px-3 py-2"
                    maxLength={50}
                  />
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <label className="flex items-center gap-1">
                    ترتیب
                    <input
                      type="number"
                      min={0}
                      value={editSort}
                      onChange={(e) => setEditSort(Number(e.target.value))}
                      className="w-16 rounded-lg border border-zinc-300 px-2 py-1"
                    />
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={editActive}
                      onChange={(e) => setEditActive(e.target.checked)}
                    />
                    فعال
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={saveEdit}
                    disabled={loading}
                    className="flex-1 rounded-full bg-pink-500 py-2 text-white font-bold"
                  >
                    ذخیره
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded-full bg-zinc-200 px-4 py-2 font-bold"
                  >
                    انصراف
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-lg">
                    <span className="ml-2">{opt.emoji}</span>
                    {opt.label}
                  </p>
                  <p className="text-xs text-zinc-400">
                    ترتیب {opt.sort_order}
                    {!opt.is_active && " · غیرفعال"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(opt)}
                    className="rounded-xl bg-zinc-100 px-3 py-2 text-sm"
                  >
                    ویرایش
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(opt)}
                    disabled={loading}
                    className="rounded-xl bg-red-50 px-3 py-2 text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
