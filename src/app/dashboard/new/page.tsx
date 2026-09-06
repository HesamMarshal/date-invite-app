import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser, requireVerified } from "@/lib/auth-guards";
import { listInviteOptions } from "@/lib/option-queries";
import {
  checkFreeCreateLimits,
  FREE_MAX_ACTIVE_INVITES,
  FREE_MAX_MONTHLY_CREATES,
} from "@/lib/plan-limits";
import CreateInvite from "@/components/create-invite";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "دعوت‌نامه جدید",
  robots: { index: false, follow: false },
};

export default async function DashboardNewInvitePage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  const verified = await requireVerified();
  if (!verified) {
    return (
      <main
        className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 p-6"
        dir="rtl"
      >
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-800">
          ← بازگشت
        </Link>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center text-sm text-amber-800">
          برای ساخت دعوت‌نامه باید با تلگرام وارد شده باشی.
        </div>
        <Link
          href="/login"
          className="rounded-full bg-pink-500 px-6 py-3 text-center font-bold text-white"
        >
          ورود با تلگرام
        </Link>
      </main>
    );
  }

  let activeOptions: Awaited<ReturnType<typeof listInviteOptions>> = [];
  let limitError: "limit_active" | "limit_monthly" | null = null;
  let dbError = false;

  try {
    const [opts, limits] = await Promise.all([
      listInviteOptions(true),
      checkFreeCreateLimits(verified.id, verified.plan_tier),
    ]);
    activeOptions = opts;
    if (!limits.ok) limitError = limits.error;
  } catch {
    dbError = true;
  }

  return (
    <main
      className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 p-6"
      dir="rtl"
    >
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← بازگشت
        </Link>
        <h1 className="text-lg font-bold">دعوت‌نامه جدید</h1>
      </div>

      {verified.plan_tier === "free" && !limitError && (
        <p className="text-center text-xs text-zinc-400">
          پلن رایگان: تا {FREE_MAX_ACTIVE_INVITES} فعال و{" "}
          {FREE_MAX_MONTHLY_CREATES} ساخت در ماه
        </p>
      )}

      {dbError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
          خطا در اتصال به دیتابیس.
        </div>
      )}

      {limitError === "limit_active" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-800">
          حداکثر {FREE_MAX_ACTIVE_INVITES} دعوت‌نامه فعال داری. یکی رو پاک کن یا
          صبر کن تا منقضی بشه.
        </div>
      )}

      {limitError === "limit_monthly" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-800">
          این ماه {FREE_MAX_MONTHLY_CREATES} دعوت‌نامه ساختی. ماه بعد دوباره
          امتحان کن.
        </div>
      )}

      {!dbError && !limitError && (
        <CreateInvite
          activeOptions={activeOptions.map((o) => ({
            id: o.id,
            emoji: o.emoji,
            label: o.label,
          }))}
          apiPath="/api/invites"
          defaultOpen
          afterCreateHref="/dashboard"
        />
      )}
    </main>
  );
}
