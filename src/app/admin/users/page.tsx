import Link from "next/link";
import { listUsersWithStats } from "@/lib/user-queries";
import { listPlanTypes } from "@/lib/plan-limits";
import UserPlanSelect from "./user-plan-select";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  let users: Awaited<ReturnType<typeof listUsersWithStats>> = [];
  let planSlugs: string[] = [];
  let dbError = false;

  try {
    const [u, plans] = await Promise.all([
      listUsersWithStats(),
      listPlanTypes(),
    ]);
    users = u;
    planSlugs = plans.map((p) => p.slug);
  } catch {
    dbError = true;
  }

  return (
    <main
      className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6"
      dir="rtl"
    >
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">کاربران</h1>
        <Link
          href="/admin"
          className="rounded-full bg-zinc-200 px-4 py-2 text-sm font-bold hover:bg-zinc-300"
        >
          ← بازگشت
        </Link>
      </div>

      {dbError ? (
        <p className="text-center text-sm text-red-500">خطا در دیتابیس</p>
      ) : users.length === 0 ? (
        <p className="text-center text-zinc-400">هنوز کاربری نیست</p>
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="space-y-2 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">
                    {u.display_name || "بدون نام"}
                    {u.is_admin ? (
                      <span className="mr-2 text-xs font-medium text-pink-600">
                        ادمین
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-zinc-500" dir="ltr">
                    {u.telegram_username
                      ? `@${u.telegram_username}`
                      : u.telegram_id
                        ? `tg:${u.telegram_id}`
                        : "—"}
                  </p>
                </div>
                <UserPlanSelect
                  userId={u.id}
                  planTier={u.plan_tier}
                  planSlugs={planSlugs}
                />
              </div>
              <p className="text-xs text-zinc-400">
                {u.invite_count} دعوت‌نامه
                {u.created_at
                  ? ` · ${new Date(u.created_at).toLocaleDateString("fa-IR")}`
                  : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
