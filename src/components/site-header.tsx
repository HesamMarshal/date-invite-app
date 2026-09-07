"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type HeaderArea = "public" | "dashboard" | "admin";

type NavItem = { href: string; label: string; primary?: boolean };

function navItems(
  area: HeaderArea,
  loggedIn: boolean,
  isAdmin: boolean
): NavItem[] {
  if (area === "admin") {
    return [
      { href: "/dashboard", label: "داشبورد" },
      { href: "/admin", label: "دعوت‌نامه‌ها" },
      { href: "/admin/users", label: "کاربران" },
      { href: "/admin/messages", label: "پیام‌ها" },
      { href: "/admin/plan-types", label: "پلن‌ها" },
      { href: "/admin/options", label: "گزینه‌ها" },
    ];
  }

  const items: NavItem[] = [
    { href: "/help", label: "راهنما" },
    { href: "/contact", label: "ارتباط با ما" },
  ];

  if (area === "dashboard") {
    if (isAdmin) items.push({ href: "/admin", label: "پنل ادمین" });
    return items;
  }

  if (loggedIn) {
    items.push({ href: "/dashboard", label: "داشبورد" });
    if (isAdmin) items.push({ href: "/admin", label: "پنل ادمین" });
    return items;
  }

  items.push({ href: "/login", label: "ورود" });
  items.push({ href: "/signup", label: "ثبت‌نام", primary: true });
  return items;
}

export default function SiteHeader({
  area,
  loggedIn,
  isAdmin = false,
}: {
  area: HeaderArea;
  loggedIn: boolean;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const items = navItems(area, loggedIn, isAdmin);

  const logout = async () => {
    setLoggingOut(true);
    try {
      await fetch(
        area === "admin" ? "/api/admin/logout" : "/api/auth/logout",
        { method: "POST" }
      );
    } finally {
      setOpen(false);
      router.replace("/");
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-100/80 bg-[#fafafa]/90 backdrop-blur-md">
      <div className="mx-auto flex w-full min-w-0 max-w-3xl items-center justify-between gap-3 px-6 py-4">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="shrink-0 whitespace-nowrap text-xl font-bold text-zinc-900"
        >
          💌 بیا با من
        </Link>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-800 transition hover:bg-zinc-100"
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "بستن منو" : "باز کردن منو"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <span className="text-xl leading-none" aria-hidden>
              ✕
            </span>
          ) : (
            <span className="flex flex-col gap-1.5" aria-hidden>
              <span className="block h-0.5 w-5 rounded-full bg-zinc-800" />
              <span className="block h-0.5 w-5 rounded-full bg-zinc-800" />
              <span className="block h-0.5 w-5 rounded-full bg-zinc-800" />
            </span>
          )}
        </button>
      </div>

      {open && (
        <nav id="site-menu" className="border-t border-zinc-100 px-6 py-3">
          <div className="mx-auto flex max-w-3xl flex-col gap-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={
                  item.primary
                    ? "rounded-2xl bg-pink-500 px-4 py-3 text-center text-sm font-bold text-white"
                    : "rounded-2xl px-4 py-3 text-sm font-bold text-zinc-700 hover:bg-zinc-100"
                }
              >
                {item.label}
              </Link>
            ))}
            {loggedIn ? (
              <button
                type="button"
                onClick={logout}
                disabled={loggingOut}
                className="rounded-2xl px-4 py-3 text-right text-sm font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40"
              >
                {loggingOut ? "..." : "خروج"}
              </button>
            ) : null}
          </div>
        </nav>
      )}
    </header>
  );
}
