"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const BASE_NAV: { href: string; label: string; primary?: boolean }[] = [
  { href: "/help", label: "راهنما" },
  { href: "/contact", label: "ارتباط با ما" },
];

const GUEST_NAV: { href: string; label: string; primary?: boolean }[] = [
  { href: "/login", label: "ورود" },
  { href: "/signup", label: "ثبت‌نام", primary: true },
];

function linkClass(primary: boolean | undefined, mobile: boolean) {
  if (mobile) {
    return primary
      ? "rounded-2xl bg-pink-500 px-4 py-3 text-center text-sm font-bold text-white"
      : "rounded-2xl px-4 py-3 text-sm font-bold text-zinc-700 hover:bg-zinc-100";
  }
  return primary
    ? "rounded-full bg-pink-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-pink-600"
    : "rounded-full px-4 py-2 text-sm font-bold text-zinc-600 transition hover:bg-zinc-100";
}

function logoutClass(mobile: boolean) {
  return mobile
    ? "rounded-2xl px-4 py-3 text-right text-sm font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40"
    : "rounded-full px-4 py-2 text-sm font-bold text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-40";
}

export default function SiteHeader({ loggedIn }: { loggedIn: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const items = loggedIn ? BASE_NAV : [...BASE_NAV, ...GUEST_NAV];

  const logout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setOpen(false);
      router.replace("/");
      router.refresh();
    }
  };

  const nav = (mobile: boolean) => (
    <>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className={linkClass(item.primary, mobile)}
        >
          {item.label}
        </Link>
      ))}
      {loggedIn ? (
        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          className={logoutClass(mobile)}
        >
          {loggingOut ? "..." : "خروج"}
        </button>
      ) : null}
    </>
  );

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

        <nav className="hidden items-center gap-1 md:flex">{nav(false)}</nav>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-800 transition hover:bg-zinc-100 md:hidden"
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
        <nav
          id="site-menu"
          className="border-t border-zinc-100 px-6 py-3 md:hidden"
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-1">
            {nav(true)}
          </div>
        </nav>
      )}
    </header>
  );
}
