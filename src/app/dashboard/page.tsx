import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-guards";
import { getInvitationsForUser } from "@/lib/invite-queries";
import {
  countActiveInvitesForUser,
  countMonthlyCreatesForUser,
  FREE_MAX_ACTIVE_INVITES,
  FREE_MAX_MONTHLY_CREATES,
} from "@/lib/plan-limits";
import CopyButton from "@/components/copy-button";
import LogoutButton from "./logout-button";
import InviteActiveToggle from "./invite-active-toggle";

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

export default async function DashboardPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  const name =
    user.display_name ||
    (user.telegram_username ? `@${user.telegram_username}` : "کاربر");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://biyabaman.ir";

  let invites: Awaited<ReturnType<typeof getInvitationsForUser>> = [];
  let activeCount = 0;
  let monthlyCount = 0;
  let dbError = false;
  try {
    [invites, activeCount, monthlyCount] = await Promise.all([
      getInvitationsForUser(user.id),
      countActiveInvitesForUser(user.id),
      countMonthlyCreatesForUser(user.id),
    ]);
  } catch {
    dbError = true;
  }

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
        <p className="text-sm text-zinc-500">دعوت‌نامه‌های تو</p>
        {user.plan_tier === "free" && !dbError && (
          <p className="text-xs text-zinc-400">
            {activeCount} از {FREE_MAX_ACTIVE_INVITES} فعال · {monthlyCount} از{" "}
            {FREE_MAX_MONTHLY_CREATES} ساخت این ماه
          </p>
        )}
      </div>

      <Link
        href="/dashboard/new"
        className="rounded-2xl border-2 border-dashed border-zinc-300 px-6 py-4 text-center text-zinc-500 transition hover:border-pink-400 hover:text-pink-600"
      >
        + ساخت دعوت‌نامه جدید
      </Link>

      {dbError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
          خطا در اتصال به دیتابیس. تنظیمات محیطی رو چک کن.
        </div>
      )}

      {!dbError && invites.length === 0 && (
        <p className="py-4 text-center text-zinc-400">هنوز دعوت‌نامه‌ای نداری</p>
      )}

      <div className="flex flex-col gap-4">
        {invites.map((inv) => {
          const status = inviteStatus(inv);
          const url = `${appUrl}/i/${inv.token}`;
          const isActive = !!inv.is_active;

          return (
            <div
              key={inv.id}
              className={`space-y-3 rounded-2xl border p-5 shadow-sm ${
                isActive
                  ? "border-zinc-100 bg-white"
                  : "border-zinc-200 bg-zinc-50 opacity-90"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-lg font-bold">{inv.recipient_name}</span>
                <span className="text-sm">{STATUS_LABEL[status]}</span>
              </div>

              {!isActive && (
                <p className="text-xs font-medium text-amber-700">
                  لینک غیرفعال است — مهمون نمی‌تونه جواب بده
                </p>
              )}

              <p className="text-sm text-zinc-500">
                {inv.recipient_name}، {inv.invite_text}
              </p>

              {inv.open_count > 0 && (
                <p className="text-xs text-zinc-400">
                  {inv.open_count} بار باز شده
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

              <div className="flex items-center gap-2 pt-1">
                <input
                  readOnly
                  value={url}
                  className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500 outline-none"
                />
                <CopyButton text={url} />
              </div>

              <InviteActiveToggle id={inv.id} isActive={isActive} />
            </div>
          );
        })}
      </div>

      {user.is_admin && (
        <Link
          href="/admin"
          className="text-center text-sm font-bold text-pink-500 hover:text-pink-600"
        >
          پنل ادمین →
        </Link>
      )}
    </main>
  );
}
