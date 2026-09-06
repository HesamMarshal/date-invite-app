import Link from "next/link";
import { listContactMessages } from "@/lib/contact-queries";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  let messages: Awaited<ReturnType<typeof listContactMessages>> = [];
  let dbError = false;

  try {
    messages = await listContactMessages(200);
  } catch {
    dbError = true;
  }

  return (
    <main
      className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6"
      dir="rtl"
    >
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">پیام‌های تماس</h1>
        <Link
          href="/admin"
          className="rounded-full bg-zinc-200 px-4 py-2 text-sm font-bold hover:bg-zinc-300"
        >
          ← بازگشت
        </Link>
      </div>

      {dbError ? (
        <p className="text-center text-sm text-red-500">
          خطا در دیتابیس — جدول contact_messages رو چک کن
        </p>
      ) : messages.length === 0 ? (
        <p className="text-center text-zinc-400">پیامی نیست</p>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className="space-y-2 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold">{m.name}</p>
                <p className="shrink-0 text-xs text-zinc-400">
                  {new Date(m.created_at).toLocaleString("fa-IR")}
                </p>
              </div>
              <p className="text-sm text-pink-600" dir="ltr">
                {m.contact}
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                {m.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
