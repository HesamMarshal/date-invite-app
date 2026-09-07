import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser, requireVerified } from "@/lib/auth-guards";
import { listInviteOptions } from "@/lib/option-queries";
import {
  checkCreateLimits,
  formatPlanCapFa,
  getPlanLimits,
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
        className="mx-auto flex min-h-screen w-full min-w-0 max-w-lg flex-col gap-6 overflow-x-clip p-6"
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
  let planLimits: Awaited<ReturnType<typeof getPlanLimits>> = null;
  let dbError = false;

  try {
    const [opts, limits, plan] = await Promise.all([
      listInviteOptions(true),
      checkCreateLimits(verified.id, verified.plan_tier),
      getPlanLimits(verified.plan_tier),
    ]);
    activeOptions = opts;
    planLimits = plan;
    if (!limits.ok) limitError = limits.error;
  } catch {
    dbError = true;
  }

  return (
    <main
      className="mx-auto flex min-h-screen w-full min-w-0 max-w-lg flex-col gap-6 overflow-x-clip p-6"
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

      {planLimits && !limitError && (
        <p className="text-center text-xs text-zinc-400">
          تا {formatPlanCapFa(planLimits.max_active)} فعال و{" "}
          {formatPlanCapFa(planLimits.max_monthly_creates)} ساخت در ماه
        </p>
      )}

      {dbError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
          خطا در اتصال به دیتابیس.
        </div>
      )}

      {limitError === "limit_active" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-800">
          حداکثر {planLimits ? formatPlanCapFa(planLimits.max_active) : "—"}{" "}
          دعوت‌نامه فعال داری. یکی رو غیرفعال کن یا صبر کن تا منقضی بشه.
        </div>
      )}

      {limitError === "limit_monthly" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-800">
          این ماه{" "}
          {planLimits ? formatPlanCapFa(planLimits.max_monthly_creates) : "—"}{" "}
          دعوت‌نامه ساختی. ماه بعد دوباره امتحان کن.
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
          maxActive={planLimits?.max_active}
          maxMonthly={planLimits?.max_monthly_creates}
        />
      )}
    </main>
  );
}
