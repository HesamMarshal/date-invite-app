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
      <h1 className="text-2xl font-bold">مدیریت گزینه‌ها</h1>

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
