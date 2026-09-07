import type { Metadata } from "next";
import Link from "next/link";
import MarketingShell from "@/components/marketing-shell";

export const metadata: Metadata = {
  title: "راهنما",
  description:
    "چطور با بیا با من ثبت‌نام کنی، لینک دعوت بسازی و مهمون چی می‌بینه.",
};

export default function HelpPage() {
  return (
    <MarketingShell>
      <article className="mx-auto max-w-lg px-6 py-14">
        <h1 className="text-3xl font-bold text-zinc-900">راهنما</h1>
        <p className="mt-3 leading-relaxed text-zinc-600">
          اینجا یاد می‌گیری بیا با من چیه، چطور وارد شی، چطور لینک بسازی و
          مهمون چه صفحه‌هایی می‌بینه.
        </p>

        <ol className="mt-10 space-y-4 text-sm font-bold text-zinc-800">
          <li className="rounded-2xl border border-zinc-100 bg-white px-4 py-3 shadow-sm">
            ۱. معرفی پروژه
          </li>
          <li className="rounded-2xl border border-zinc-100 bg-white px-4 py-3 shadow-sm">
            ۲. ثبت‌نام و ورود با تلگرام
          </li>
          <li className="rounded-2xl border border-zinc-100 bg-white px-4 py-3 shadow-sm">
            ۳. ساخت لینک و کپی
          </li>
          <li className="rounded-2xl border border-zinc-100 bg-white px-4 py-3 shadow-sm">
            ۴. تجربه مهمون
          </li>
        </ol>

        <p className="mt-8 text-sm text-zinc-500">
          متن کامل هر بخش و عکس‌های راهنما به‌زودی همین‌جا می‌آد.
        </p>

        <p className="mt-6">
          <Link
            href="/signup"
            className="font-bold text-pink-600 hover:underline"
          >
            شروع رایگان ←
          </Link>
        </p>
      </article>
    </MarketingShell>
  );
}
