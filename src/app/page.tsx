import type { Metadata } from "next";
import Link from "next/link";
import MarketingShell from "@/components/marketing-shell";

export const metadata: Metadata = {
  title: {
    absolute: "بیا با من — دعوت‌نامه برای قرار",
  },
  description:
    "لینک دعوت‌نامه بفرست، جواب رو ببین. تجربه شوخ و فارسی برای دعوت به قرار — تاریخ، ساعت و غذا.",
};

const steps = [
  {
    n: "۱",
    title: "دعوت‌نامه بساز",
    text: "با تلگرام وارد شو، اسم طرف مقابل رو بنویس و لینک بگیر.",
  },
  {
    n: "۲",
    title: "لینک رو بفرست",
    text: "لینک خصوصی رو تو واتساپ، تلگرام یا هرجایی بفرست.",
  },
  {
    n: "۳",
    title: "جواب رو ببین",
    text: "تاریخ، ساعت و غذا رو انتخاب می‌کنه — تو تو داشبورد می‌بینی.",
  },
];

export default function Home() {
  return (
    <MarketingShell>
      {/* First viewport: brand + one headline + one line + one CTA */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(236,72,153,0.14),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(251,113,133,0.08),_transparent_50%)]"
        />
        <div className="relative mx-auto flex min-h-[85vh] max-w-lg flex-col items-center justify-center gap-8 px-6 py-20 text-center">
          <p className="animate-float text-5xl sm:text-6xl" aria-hidden>
            💌
          </p>
          <div className="animate-fade-in space-y-5">
            <p className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
              بیا با من
            </p>
            <h1 className="text-xl font-medium leading-relaxed text-zinc-700 sm:text-2xl">
              لینک دعوت بفرست، جواب قرار رو ببین
            </h1>
            <p className="mx-auto max-w-sm text-base leading-relaxed text-zinc-500">
              شوخ، فارسی، مخصوص موبایل — تاریخ، ساعت و غذا رو مهمون انتخاب
              می‌کنه.
            </p>
          </div>
          <div className="animate-fade-in flex flex-col items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-pink-500 px-8 py-4 text-lg font-bold text-white transition hover:bg-pink-600 active:scale-[0.97]"
            >
              شروع رایگان
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-500 underline-offset-4 hover:text-zinc-800 hover:underline"
            >
              قبلاً ثبت‌نام کردی؟ ورود
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-100 bg-white/60">
        <div className="mx-auto max-w-lg px-6 py-16">
          <h2 className="mb-10 text-center text-2xl font-bold text-zinc-900">
            چطور کار می‌کنه؟
          </h2>
          <ol className="space-y-8">
            {steps.map((step) => (
              <li key={step.n} className="flex gap-4 text-right">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-100 text-sm font-bold text-pink-700">
                  {step.n}
                </span>
                <div>
                  <p className="font-bold text-zinc-900">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-zinc-100">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-5 px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-zinc-900">
            اولین دعوت‌نامه‌ت رو بساز
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-zinc-500">
            ثبت‌نام با تلگرام؛ بعدش لینک اختصاصی می‌گیری و می‌فرستی.
          </p>
          <Link
            href="/signup"
            className="inline-flex min-w-[200px] items-center justify-center rounded-full bg-pink-500 px-8 py-3.5 text-base font-bold text-white transition hover:bg-pink-600 active:scale-[0.97]"
          >
            شروع کن
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
