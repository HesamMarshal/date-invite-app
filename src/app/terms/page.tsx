import type { Metadata } from "next";
import Link from "next/link";
import MarketingShell from "@/components/marketing-shell";
import { getSiteContact } from "@/lib/site-contact";

export const metadata: Metadata = {
  title: "قوانین استفاده",
  description: "شرایط استفاده از سرویس بیا با من.",
};

export default function TermsPage() {
  const c = getSiteContact();

  return (
    <MarketingShell>
      <article className="mx-auto max-w-3xl space-y-6 px-6 py-14 leading-relaxed text-zinc-700">
        <h1 className="text-3xl font-bold text-zinc-900">قوانین استفاده</h1>
        <p className="text-sm text-zinc-500">آخرین به‌روزرسانی: شهریور ۱۴۰۵</p>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">۱. درباره سرویس</h2>
          <p>
            {c.brandFa} ({c.brandEn}) ابزاری برای ساخت و ارسال لینک دعوت‌نامه
            خصوصی به قرار است. مهمان با لینک اختصاصی به سوال‌های ساده (مثل تاریخ،
            ساعت و انتخاب غذا) پاسخ می‌دهد و نتیجه برای صاحب دعوت‌نامه ذخیره
            می‌شود.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">۲. حساب کاربری</h2>
          <p>
            برای ساخت دعوت‌نامه باید حساب بسازید و شماره موبایل خود را تأیید
            کنید. شما مسئول حفظ دسترسی به حساب و لینک‌های دعوت‌نامه‌ای هستید که
            می‌سازید.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">۳. استفاده مجاز</h2>
          <p>
            از سرویس فقط برای دعوت‌های مشروع و غیرآزاردهنده استفاده کنید. ارسال
            اسپم، محتوای غیرقانونی، یا سوءاستفاده از لینک‌ها ممنوع است. در صورت
            تخلف ممکن است حساب محدود شود.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">۴. محدودیت‌ها</h2>
          <p>
            در طرح رایگان ممکن است سقف تعداد دعوت‌نامه فعال یا ماهانه اعمال شود.
            سرویس «همان‌طور که هست» ارائه می‌شود و ممکن است گاهی قطع یا تغییر
            کند.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-zinc-900">۵. تماس</h2>
          <p>
            سوالات را از صفحه{" "}
            <Link href="/contact" className="font-bold text-pink-600 hover:underline">
              ارتباط با ما
            </Link>{" "}
            بفرستید.
          </p>
        </section>
      </article>
    </MarketingShell>
  );
}
