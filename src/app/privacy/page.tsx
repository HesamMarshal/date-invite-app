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
          <h2 className="text-xl font-bold text-zinc-900">۱. چه داده‌هایی جمع می‌کنیم؟</h2>
          <p>
            برای ثبت‌نام و ورود، شماره موبایل شما را ذخیره می‌کنیم و با پیامک کد
            تأیید می‌فرستیم. برای هر دعوت‌نامه، نام گیرنده، لینک، وضعیت باز شدن،
            و پاسخ مهمان (پذیرش/رد، تاریخ‌زمان، انتخاب غذا) نگهداری می‌شود.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">۲. هدف استفاده</h2>
          <p>
            داده‌ها فقط برای ارائه سرویس دعوت‌نامه، امنیت حساب، جلوگیری از سوءاستفاده
            و بهبود محصول استفاده می‌شوند. شماره موبایل برای ارسال کد یک‌بارمصرف
            (OTP) به کار می‌رود.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">۳. اشتراک‌گذاری</h2>
          <p>
            برای ارسال پیامک تأیید از سرویس‌دهندهٔ پیامکی (کاوه نگار) استفاده
            می‌کنیم؛ فقط شماره و کد لازم به آن‌ها ارسال می‌شود. داده‌ها را به
            اشخاص ثالث برای تبلیغات نمی‌فروشیم.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">۴. نگهداری و امنیت</h2>
          <p>
            اطلاعات روی سرور امن نگهداری می‌شود. لینک دعوت‌نامه خصوصی است؛ با این
            حال هر کسی که لینک را داشته باشد می‌تواند صفحه مهمان را باز کند — لینک
            را فقط برای فرد مورد نظر بفرستید.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">۵. تماس</h2>
          <p>
            برای درخواست حذف یا سوال درباره داده‌ها به{" "}
            <a
              href={`mailto:${c.email}`}
              className="font-bold text-pink-600 hover:underline"
              dir="ltr"
            >
              {c.email}
            </a>{" "}
            یا صفحه{" "}
            <Link href="/contact" className="font-bold text-pink-600 hover:underline">
              ارتباط با ما
            </Link>{" "}
            مراجعه کنید.
          </p>
        </section>
      </article>
    </MarketingShell>
  );
}
