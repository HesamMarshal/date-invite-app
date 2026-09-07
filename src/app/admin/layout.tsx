import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import { requireAdmin } from "@/lib/auth-guards";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * /admin gate (14-2): Telegram session with `users.is_admin = 1` only.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  if (!admin) {
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center"
        dir="rtl"
      >
        <p className="text-4xl" aria-hidden>
          🔒
        </p>
        <p className="text-xl font-bold">پنل ادمین</p>
        <p className="max-w-xs text-sm text-zinc-500">
          ورود فقط با تلگرام برای حساب‌هایی که{" "}
          <span dir="ltr">is_admin</span> دارن.
        </p>
        <Link
          href="/login"
          className="rounded-full bg-pink-500 px-8 py-3 font-bold text-white hover:bg-pink-600"
        >
          ورود با تلگرام
        </Link>
        <Link href="/" className="text-sm text-zinc-500 hover:underline">
          بازگشت
        </Link>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip">
      <SiteHeader area="admin" loggedIn isAdmin />
      {children}
    </div>
  );
}
