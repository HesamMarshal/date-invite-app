import type { Metadata } from "next";
import Link from "next/link";
import MarketingShell from "@/components/marketing-shell";
import {
  formatMobileDisplay,
  getSiteContact,
} from "@/lib/site-contact";

export const metadata: Metadata = {
  title: "ارتباط با ما",
  description: "راه‌های تماس با بیا با من — ایمیل برند.",
};

export default function ContactPage() {
  const c = getSiteContact();
  const mobileDisplay = c.mobile ? formatMobileDisplay(c.mobile) : "";

  return (
    <MarketingShell>
      <article className="mx-auto max-w-3xl px-6 py-14">
        <h1 className="text-3xl font-bold">ارتباط با ما</h1>
        <p className="mt-3 max-w-xl text-zinc-600 leading-relaxed">
          برای پشتیبانی، پیشنهاد یا سوال دربارهٔ {c.brandFa} از راه‌های زیر با ما
          در تماس باشید.
        </p>

        <dl className="mt-10 space-y-6 text-base">
          <div>
            <dt className="text-sm font-bold text-zinc-500">نام سرویس</dt>
            <dd className="mt-1 font-bold text-zinc-900">
              {c.brandFa} ({c.brandEn}) —{" "}
              <span dir="ltr">
                {c.siteUrl.replace(/^https?:\/\//, "")}
              </span>
            </dd>
          </div>
          {c.address ? (
            <div>
              <dt className="text-sm font-bold text-zinc-500">آدرس</dt>
              <dd className="mt-1 text-zinc-900">{c.address}</dd>
            </div>
          ) : null}
          {c.landline ? (
            <div>
              <dt className="text-sm font-bold text-zinc-500">تلفن ثابت</dt>
              <dd className="mt-1 text-zinc-900" dir="ltr">
                <a
                  href={`tel:${c.landline.replace(/\s/g, "")}`}
                  className="underline-offset-2 hover:underline"
                >
                  {c.landline}
                </a>
              </dd>
            </div>
          ) : null}
          {c.mobile ? (
            <div>
              <dt className="text-sm font-bold text-zinc-500">موبایل</dt>
              <dd className="mt-1 text-zinc-900" dir="ltr">
                <a
                  href={`tel:${c.mobile.replace(/\s/g, "")}`}
                  className="underline-offset-2 hover:underline"
                >
                  {mobileDisplay}
                </a>
              </dd>
            </div>
          ) : null}
          {c.email ? (
            <div>
              <dt className="text-sm font-bold text-zinc-500">ایمیل</dt>
              <dd className="mt-1 text-zinc-900" dir="ltr">
                <a
                  href={`mailto:${c.email}`}
                  className="underline-offset-2 hover:underline"
                >
                  {c.email}
                </a>
              </dd>
            </div>
          ) : null}
          {c.telegram ? (
            <div>
              <dt className="text-sm font-bold text-zinc-500">تلگرام</dt>
              <dd className="mt-1 text-zinc-900" dir="ltr">
                <a
                  href={`https://t.me/${c.telegram}`}
                  className="underline-offset-2 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @{c.telegram}
                </a>
              </dd>
            </div>
          ) : null}
        </dl>

        <p className="mt-10 text-sm text-zinc-500">
          فرم پیام به‌زودی همین‌جاست — فعلاً به ایمیل برند بنویس.{" "}
          <Link href="/" className="font-bold text-pink-600 hover:underline">
            بازگشت به خانه
          </Link>
        </p>
      </article>
    </MarketingShell>
  );
}
