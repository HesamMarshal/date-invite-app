import { getAllInvitationsWithResponses } from "@/lib/invite-queries";
import CreateInvite from "./create-invite";
import CopyButtonClient from "./copy-button";
import DeleteInviteButton from "./delete-invite-button";
import LogoutButton from "./logout-button";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let invites: Awaited<ReturnType<typeof getAllInvitationsWithResponses>> = [];
  let dbError = false;

  try {
    invites = await getAllInvitationsWithResponses();
  } catch {
    dbError = true;
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://invite.hesammarshal.ir";

  return (
    <main className="flex flex-col gap-8 p-6 max-w-2xl mx-auto min-h-screen" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📋 دعوت‌نامه‌ها</h1>
        <LogoutButton />
      </div>

      {dbError && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 text-center">
          خطا در اتصال به دیتابیس. تنظیمات محیطی رو چک کن.
        </div>
      )}

      <CreateInvite appUrl={appUrl} />

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

          const url = `${appUrl}/i/${inv.token}`;

          return (
            <div
              key={inv.id}
              className="rounded-2xl bg-white p-5 shadow-sm border border-zinc-100 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg">{inv.recipient_name}</span>
                <span className="text-sm">{statusLabel}</span>
              </div>

              <p className="text-sm text-zinc-500">
                {inv.recipient_name}، {inv.invite_text}
              </p>

              {inv.open_count > 0 && (
                <p className="text-xs text-zinc-400">
                  {inv.open_count} بار باز شده
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

              <div className="flex items-center gap-2 pt-2">
                <input
                  readOnly
                  value={url}
                  className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500 outline-none"
                />
                <CopyButtonClient text={url} />
                <DeleteInviteButton id={inv.id} name={inv.recipient_name} />
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
