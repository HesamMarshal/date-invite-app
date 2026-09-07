import Link from "next/link";
import { listInviteOptions } from "@/lib/option-queries";
import OptionsManager from "./options-manager";

export const dynamic = "force-dynamic";

export default async function AdminOptionsPage() {
  let options: Awaited<ReturnType<typeof listInviteOptions>> = [];
  let dbError = false;
  try {
    options = await listInviteOptions(false);
  } catch {
    dbError = true;
  }

  return (
    <main className="flex flex-col gap-6 p-6 max-w-2xl mx-auto min-h-screen" dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">مدیریت گزینه‌ها</h1>
        <Link
          href="/admin"
          className="rounded-full bg-zinc-200 px-4 py-2 text-sm font-bold hover:bg-zinc-300"
        >
          ← بازگشت
        </Link>
      </div>

      {dbError ? (
        <p className="text-center text-red-500 text-sm">
          خطا در اتصال به دیتابیس
        </p>
      ) : (
        <OptionsManager initialOptions={options} />
      )}
    </main>
  );
}
