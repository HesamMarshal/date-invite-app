"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-700 transition hover:bg-zinc-200 disabled:opacity-40"
    >
      {loading ? "..." : "خروج"}
    </button>
  );
}
