import type { Metadata } from "next";
import Link from "next/link";
import MarketingShell from "@/components/marketing-shell";
import { getSiteContact } from "@/lib/site-contact";

export const metadata: Metadata = {
  title: "حریم خصوصی",
  description: "نحوهٔ نگهداری و استفاده از اطلاعات در بیا با من.",
};

export default function PrivacyPage() {
  const c = getSiteContact();

  return (
    <MarketingShell>
      <article className="mx-auto max-w-3xl space-y-6 px-6 py-14 leading-relaxed text-zinc-700">
        <h1 className="text-3xl font-bold text-zinc-900">حریم خصوصی</h1>
        <p className="text-sm text-zinc-500">آخرین به‌روزرسانی: شهریور ۱۴۰۵</p>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">
            ۱. چه داده‌هایی جمع می‌کنیم؟
          </h2>
          <p>
            برای ورود و ثبت‌نام از{" "}
            <strong className="font-bold text-zinc-800">تلگرام Login Widget</strong>{" "}
            استفاده می‌کنیم؛ شناسه تلگرام، نام نمایشی و در صورت وجود نام کاربری
            تلگرام ذخیره می‌شود. برای هر دعوت‌نامه، نام گیرنده، متن دعوت، لینک،
            وضعیت باز شدن، و پاسخ مهمان (پذیرش/رد، تاریخ‌زمان، انتخاب غذا)
            نگهداری می‌شود.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">۲. هدف استفاده</h2>
          <p>
            داده‌ها فقط برای ارائه سرویس دعوت‌نامه، امنیت حساب، جلوگیری از
            سوءاستفاده و بهبود محصول استفاده می‌شوند.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">۳. اشتراک‌گذاری</h2>
          <p>
            ورود از طریق تلگرام انجام می‌شود؛ طبق سیاست تلگرام، دادهٔ لازم برای
            تأیید هویت به سرور ما ارسال می‌شود. داده‌های دعوت‌نامه را به اشخاص
            ثالث برای تبلیغات نمی‌فروشیم.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">۴. نگهداری و امنیت</h2>
          <p>
            اطلاعات روی سرور نگهداری می‌شود. لینک دعوت‌نامه خصوصی است؛ هر کسی که
            لینک را داشته باشد می‌تواند صفحه مهمان را باز کند — لینک را فقط برای
            فرد مورد نظر بفرستید.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">۵. تماس</h2>
          <p>
            برای درخواست حذف یا سوال درباره داده‌ها به صفحه{" "}
            <Link
              href="/contact"
              className="font-bold text-pink-600 hover:underline"
            >
              ارتباط با ما
            </Link>
            {c.email ? (
              <>
                {" "}
                یا{" "}
                <a
                  href={`mailto:${c.email}`}
                  className="font-bold text-pink-600 hover:underline"
                  dir="ltr"
                >
                  {c.email}
                </a>
              </>
            ) : null}{" "}
            مراجعه کنید.
          </p>
        </section>
      </article>
    </MarketingShell>
  );
}
