import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import LogoutButton from "./logout-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "پنل",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const name =
    user.display_name ||
    (user.telegram_username ? `@${user.telegram_username}` : "کاربر");

  return (
    <main
      className="mx-auto flex min-h-screen max-w-lg flex-col gap-8 p-6"
      dir="rtl"
    >
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="text-lg font-bold text-zinc-900">
          💌 بیا با من
        </Link>
        <LogoutButton />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">سلام {name} 👋</h1>
        <p className="text-sm text-zinc-500">
          وارد شدی. ساخت دعوت‌نامه از پنل کاربری به‌زودی اینجاست.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm space-y-2 text-sm text-zinc-600">
        <p>
          <span className="text-zinc-400">پلن:</span>{" "}
          {user.plan_tier === "pro" ? "Pro" : "رایگان"}
        </p>
        {user.telegram_username && (
          <p>
            <span className="text-zinc-400">تلگرام:</span> @
            {user.telegram_username}
          </p>
        )}
      </div>

      <Link
        href="/admin"
        className="text-center text-sm font-bold text-pink-500 hover:text-pink-600"
      >
        پنل ادمین (موقت) →
      </Link>
    </main>
  );
}
