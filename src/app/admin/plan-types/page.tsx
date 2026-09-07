import Link from "next/link";
import { listPlanTypes } from "@/lib/plan-limits";
import PlanTypesManager from "./plan-types-manager";

export const dynamic = "force-dynamic";

export default async function AdminPlanTypesPage() {
  let plans: Awaited<ReturnType<typeof listPlanTypes>> = [];
  let dbError = false;
  try {
    plans = await listPlanTypes();
  } catch {
    dbError = true;
  }

  return (
    <main
      className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6"
      dir="rtl"
    >
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">پلن‌ها و سقف‌ها</h1>
        <Link
          href="/admin"
          className="rounded-full bg-zinc-200 px-4 py-2 text-sm font-bold hover:bg-zinc-300"
        >
          ← بازگشت
        </Link>
      </div>

      <p className="text-sm text-zinc-500">
        سقف دعوت فعال و ساخت ماهانه از جدول{" "}
        <span dir="ltr">plan_types</span> خونده می‌شه. مقدار{" "}
        <span dir="ltr">-1</span> یعنی بدون سقف.
      </p>

      {dbError ? (
        <p className="text-center text-sm text-red-500">
          خطا در اتصال به دیتابیس
        </p>
      ) : (
        <PlanTypesManager initialPlans={plans} />
      )}
    </main>
  );
}
