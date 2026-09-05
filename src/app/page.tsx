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

function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-full bg-pink-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-pink-500/20 transition hover:bg-pink-600 hover:shadow-pink-500/30 active:scale-[0.97]"
    >
      {children}
    </Link>
  );
}

function SecondaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-bold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 active:scale-[0.97]"
    >
      {children}
    </Link>
  );
}

const steps = [
  {
    emoji: "✨",
    title: "دعوت‌نامه بساز",
    text: "ثبت‌نام کن، اسم طرف مقابل رو بنویس و لینک اختصاصی بگیر.",
  },
  {
    emoji: "📲",
    title: "لینک رو بفرست",
    text: "لینک خصوصی رو تو واتساپ، تلگرام یا هر جایی که دوست داری بفرست.",
  },
  {
    emoji: "💬",
    title: "جواب رو ببین",
    text: "طرف مقابل تاریخ، ساعت و غذا رو انتخاب می‌کنه — تو همون لحظه خبر می‌شه.",
  },
];

const features = [
  { emoji: "📱", title: "مخصوص موبایل", text: "طراحی ساده و روان برای گوشی" },
  {
    emoji: "🔒",
    title: "لینک خصوصی",
    text: "هر دعوت‌نامه لینک مخصوص خودش رو داره",
  },
  {
    emoji: "😄",
    title: "شوخ و فارسی",
    text: "تجربه‌ای دوستانه، نه فرم خشک و رسمی",
  },
  {
    emoji: "✏️",
    title: "قابل تغییر",
    text: "اگه نظرش عوض شد، می‌تونه دوباره جواب بده",
  },
];

export default function Home() {
  return (
    <MarketingShell>
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 py-16 text-center sm:py-24">
        <p className="animate-float text-6xl">💌</p>
        <div className="animate-fade-in space-y-4">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            با من سر قرار میای؟
          </h1>
          <p className="mx-auto max-w-lg text-lg leading-relaxed text-zinc-600">
            لینک دعوت‌نامه بفرست، جواب رو ببین. بدون دردسر، با حس شوخی — تاریخ،
            ساعت و غذا رو طرف مقابل انتخاب می‌کنه و تو خبر می‌شی.
          </p>
        </div>
        <div className="animate-fade-in flex flex-col gap-3 sm:flex-row">
          <PrimaryLink href="/signup">رایگان ثبت‌نام کن</PrimaryLink>
          <SecondaryLink href="/login">ورود</SecondaryLink>
        </div>
      </section>

      <section className="border-y border-zinc-100 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="mb-10 text-center text-2xl font-bold">
            چطور کار می‌کنه؟
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="animate-fade-in rounded-2xl border border-zinc-100 bg-zinc-50 p-6 text-center"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <p className="mb-3 text-3xl">{step.emoji}</p>
                <p className="mb-2 font-bold">{step.title}</p>
                <p className="text-sm leading-relaxed text-zinc-600">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold">چرا بیا با من؟</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-4 rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm"
            >
              <span className="text-2xl">{f.emoji}</span>
              <div>
                <p className="font-bold">{f.title}</p>
                <p className="mt-1 text-sm text-zinc-600">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-pink-50">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-16 text-center">
          <h2 className="text-2xl font-bold">
            آماده‌ای اولین دعوت‌نامه رو بسازی؟
          </h2>
          <p className="max-w-md text-zinc-600">
            ثبت‌نام رایگانه. چند ثانیه طول می‌کشه — بعدش لینک اختصاصی می‌گیری و
            می‌فرستی.
          </p>
          <PrimaryLink href="/signup">شروع کن</PrimaryLink>
          <p className="text-sm text-zinc-500">
            سوالی داری؟{" "}
            <Link
              href="/contact"
              className="font-bold text-pink-600 hover:underline"
            >
              با ما تماس بگیر
            </Link>
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
