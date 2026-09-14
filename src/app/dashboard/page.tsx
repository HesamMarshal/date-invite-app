import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-guards";
import { getInvitationsWithResponses } from "@/lib/invite-queries";
import {
  countActiveInvitesForUser,
  countMonthlyCreatesForUser,
  formatPlanCapFa,
  getPlanLimits,
  isUnlimitedCap,
} from "@/lib/plan-limits";
import CopyButton from "@/components/copy-button";
import StartBotHint from "@/components/start-bot-hint";
import InviteActiveToggle from "./invite-active-toggle";
import { toPersianDigits } from "@/lib/datetime";
import { getTelegramNotifyStartUrl } from "@/lib/telegram-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "پنل",
  robots: { index: false, follow: false },
};

function inviteStatus(inv: {
  accepted: number | null;
  open_count: number;
}): "accepted" | "rejected" | "opened" | "unseen" {
  if (inv.accepted === 1) return "accepted";
  if (inv.accepted === 0) return "rejected";
  if (inv.open_count > 0) return "opened";
  return "unseen";
}

const STATUS_LABEL = {
  accepted: "✅ قبول کرده",
  rejected: "❌ رد کرده",
  opened: "👀 باز کرده",
  unseen: "🔗 باز نکرده",
} as const;

const KIND_LABEL = {
  funny: "با مزه",
  real: "واقعی",
} as const;

export default async function DashboardPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  const name =
    user.display_name ||
    (user.telegram_username ? `@${user.telegram_username}` : "کاربر");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://biyabaman.ir";
  const botStartUrl =
    !user.telegram_notify_ok ? getTelegramNotifyStartUrl() : null;

  let invites: Awaited<ReturnType<typeof getInvitationsWithResponses>> = [];
  let activeCount = 0;
  let monthlyCount = 0;
  let planLimits: Awaited<ReturnType<typeof getPlanLimits>> = null;
  let dbError = false;
  try {
    [invites, activeCount, monthlyCount, planLimits] = await Promise.all([
      getInvitationsWithResponses(user.id),
      countActiveInvitesForUser(user.id),
      countMonthlyCreatesForUser(user.id),
      getPlanLimits(user.plan_tier),
    ]);
  } catch {
    dbError = true;
  }

  const atActiveCap =
    !!planLimits &&
    !dbError &&
    !user.is_admin &&
    !isUnlimitedCap(planLimits.max_active) &&
    activeCount >= planLimits.max_active;
  const atMonthlyCap =
    !!planLimits &&
    !dbError &&
    !user.is_admin &&
    !isUnlimitedCap(planLimits.max_monthly_creates) &&
    monthlyCount >= planLimits.max_monthly_creates;
  const createBlocked = atActiveCap || atMonthlyCap;

  return (
    <main
      className="mx-auto flex min-h-screen w-full min-w-0 max-w-lg flex-col gap-8 overflow-x-clip p-6"
      dir="rtl"
    >
      <div className="space-y-2">
        <h1 className="break-words text-2xl font-bold">سلام {name} 👋</h1>
        <p className="text-sm text-zinc-500">دعوت‌نامه‌های تو</p>
        {planLimits && !dbError && (
          <p className="text-xs text-zinc-400">
            {toPersianDigits(activeCount)} از{" "}
            {formatPlanCapFa(planLimits.max_active)} فعال ·{" "}
            {toPersianDigits(monthlyCount)} از{" "}
            {formatPlanCapFa(planLimits.max_monthly_creates)} ساخت این ماه
          </p>
        )}
      </div>

      {createBlocked ? (
        <div className="space-y-3">
          <p className="text-sm font-bold text-zinc-700">ساخت دعوت‌نامه جدید</p>
          {atActiveCap && planLimits && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-800">
              حداکثر {formatPlanCapFa(planLimits.max_active)} دعوت‌نامه فعال
              داری. یکی رو غیرفعال کن یا صبر کن تا منقضی بشه.
            </div>
          )}
          {atMonthlyCap && planLimits && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-800">
              این ماه {formatPlanCapFa(planLimits.max_monthly_creates)} دعوت‌نامه
              ساختی. ماه بعد دوباره امتحان کن.
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-bold text-zinc-700">ساخت دعوت‌نامه جدید</p>
          <Link
            href="/dashboard/new?kind=funny"
            className="block rounded-2xl border-2 border-zinc-200 bg-white px-4 py-4 text-right transition hover:border-pink-400 hover:bg-pink-50"
          >
            <span className="block font-bold text-zinc-800">لینک با مزه</span>
            <span className="mt-1 block text-sm text-zinc-500">
              دکمه نه کوچیک می‌شه
            </span>
          </Link>
          <Link
            href="/dashboard/new?kind=real"
            className="block rounded-2xl border-2 border-zinc-200 bg-white px-4 py-4 text-right transition hover:border-pink-400 hover:bg-pink-50"
          >
            <span className="block font-bold text-zinc-800">دعوت واقعی</span>
            <span className="mt-1 block text-sm text-zinc-500">
              بله و نه هر دو جدی‌ان
            </span>
          </Link>
        </div>
      )}

      {dbError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
          خطا در اتصال به دیتابیس. تنظیمات محیطی رو چک کن.
        </div>
      )}

      {!dbError && invites.length === 0 && (
        <div className="space-y-2 py-4 text-center">
          <p className="text-zinc-400">هنوز دعوت‌نامه‌ای نداری</p>
          <p className="text-sm text-zinc-500">
            نمی‌دونی از کجا شروع کنی؟{" "}
            <Link
              href="/help"
              className="font-bold text-pink-600 hover:underline"
            >
              راهنما رو بخون
            </Link>
          </p>
        </div>
      )}

      <div className="flex min-w-0 flex-col gap-4">
        {invites.map((inv) => {
          const status = inviteStatus(inv);
          const url = `${appUrl}/i/${inv.token}`;
          const isActive = !!inv.is_active;

          return (
            <div
              key={inv.id}
              className={`min-w-0 max-w-full space-y-3 rounded-2xl border p-5 shadow-sm ${
                isActive
                  ? "border-zinc-100 bg-white"
                  : "border-zinc-200 bg-zinc-50 opacity-90"
              }`}
            >
              <div className="flex min-w-0 items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="min-w-0 truncate text-lg font-bold">
                    {inv.recipient_name}
                  </span>
                  <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
                    {KIND_LABEL[inv.kind]}
                  </span>
                </div>
                <span className="shrink-0 text-sm">{STATUS_LABEL[status]}</span>
              </div>

              {!isActive && (
                <p className="text-xs font-medium text-amber-700">
                  لینک غیرفعال است — مهمون نمی‌تونه جواب بده
                </p>
              )}

              <p className="break-words text-sm text-zinc-500">
                {inv.recipient_name}، {inv.invite_text}
              </p>

              {inv.open_count > 0 && (
                <p className="text-xs text-zinc-400">
                  {toPersianDigits(inv.open_count)} بار باز شده
                </p>
              )}

              {status === "accepted" && (
                <div className="space-y-1 text-sm text-zinc-600">
                  {inv.selected_datetime && (
                    <>
                      <p>
                        📅{" "}
                        {new Date(inv.selected_datetime).toLocaleDateString(
                          "fa-IR",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                      <p>
                        🕐{" "}
                        {new Date(inv.selected_datetime).toLocaleTimeString(
                          "fa-IR",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </p>
                    </>
                  )}
                  {inv.food_choice && <p>🍽️ {inv.food_choice}</p>}
                </div>
              )}

              <div className="flex min-w-0 flex-col gap-2 pt-1 sm:flex-row sm:items-center">
                <input
                  readOnly
                  value={url}
                  dir="ltr"
                  className="w-full min-w-0 flex-1 truncate rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500 outline-none"
                />
                <CopyButton
                  text={url}
                  shareTitle={`دعوت برای ${inv.recipient_name}`}
                />
              </div>

              <InviteActiveToggle
                id={inv.id}
                isActive={isActive}
                maxActive={planLimits?.max_active}
              />
            </div>
          );
        })}
      </div>

      {botStartUrl ? (
        <div className="rounded-2xl border border-pink-200 bg-pink-50 px-4 py-3">
          <StartBotHint href={botStartUrl} />
        </div>
      ) : null}

    </main>
  );
}
