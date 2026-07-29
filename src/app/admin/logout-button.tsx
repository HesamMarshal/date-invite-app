"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-full bg-zinc-200 px-4 py-2 text-sm font-medium transition hover:bg-zinc-300"
    >
      خروج
    </button>
  );
}
