import { getInvitationsWithResponses } from "@/lib/invite-queries";
import { listInviteOptions } from "@/lib/option-queries";
import CreateInvite from "./create-invite";
import CopyButton from "@/components/copy-button";
import { toPersianDigits } from "@/lib/datetime";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let invites: Awaited<ReturnType<typeof getInvitationsWithResponses>> = [];
  let activeOptions: Awaited<ReturnType<typeof listInviteOptions>> = [];
  let dbError = false;

  try {
    [invites, activeOptions] = await Promise.all([
      getInvitationsWithResponses(),
      listInviteOptions(true),
    ]);
  } catch {
    dbError = true;
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://biyabaman.ir";

  return (
    <main className="mx-auto flex min-h-screen w-full min-w-0 max-w-2xl flex-col gap-8 overflow-x-clip p-6" dir="rtl">
      <h1 className="text-2xl font-bold">📋 دعوت‌نامه‌ها</h1>

      {dbError && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 text-center">
          خطا در اتصال به دیتابیس. تنظیمات محیطی رو چک کن.
        </div>
      )}

      {!dbError && (
        <CreateInvite
          activeOptions={activeOptions.map((o) => ({
            id: o.id,
            emoji: o.emoji,
            label: o.label,
          }))}
        />
      )}

      {!dbError && invites.length === 0 && (
        <p className="text-zinc-400 text-center py-12">
          هنوز دعوت‌نامه‌ای ساخته نشده
        </p>
      )}

      <div className="flex flex-col gap-4">
        {invites.map((inv) => {
          const status =
            inv.accepted === 1
              ? "accepted"
              : inv.accepted === 0
                ? "rejected"
                : inv.open_count > 0
                  ? "opened"
                  : "unseen";

          const statusLabel = {
            accepted: "✅ قبول کرده",
            rejected: "❌ رد کرده",
            opened: "👀 باز کرده",
            unseen: "🔗 باز نکرده",
          }[status];

          const kindLabel = inv.kind === "real" ? "واقعی" : "با مزه";

          const url = `${appUrl}/i/${inv.token}`;

          return (
            <div
              key={inv.id}
              className="min-w-0 max-w-full space-y-3 rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm"
            >
              <div className="flex min-w-0 items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="min-w-0 truncate text-lg font-bold">
                    {inv.recipient_name}
                  </span>
                  <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
                    {kindLabel}
                  </span>
                </div>
                <span className="shrink-0 text-sm">{statusLabel}</span>
              </div>

              <p className="text-sm text-zinc-500">
                {inv.recipient_name}، {inv.invite_text}
              </p>

              {inv.open_count > 0 && (
                <p className="text-xs text-zinc-400">
                  {toPersianDigits(inv.open_count)} بار باز شده
                </p>
              )}

              {status === "accepted" && (
                <div className="text-sm text-zinc-600 space-y-1">
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

              <div className="flex min-w-0 flex-col gap-2 pt-2 sm:flex-row sm:items-center">
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
            </div>
          );
        })}
      </div>
    </main>
  );
}
