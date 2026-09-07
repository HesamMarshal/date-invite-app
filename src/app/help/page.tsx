import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MarketingShell from "@/components/marketing-shell";

export const metadata: Metadata = {
  title: "راهنما",
  description:
    "چطور با بیا با من ثبت‌نام کنی، لینک دعوت بسازی و مهمون چی می‌بینه.",
};

function HelpShot({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <figure className="space-y-2">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-sm">
        <Image
          src={src}
          alt={alt}
          width={720}
          height={1280}
          className="h-auto w-full object-contain object-top"
        />
      </div>
      <figcaption className="text-center text-xs text-zinc-500">
        {caption}
      </figcaption>
    </figure>
  );
}

export default function HelpPage() {
  return (
    <MarketingShell>
      <article className="mx-auto max-w-lg px-6 py-14">
        <h1 className="text-3xl font-bold text-zinc-900">راهنما</h1>
        <p className="mt-3 leading-relaxed text-zinc-600">
          اینجا یاد می‌گیری بیا با من چیه، چطور وارد شی، چطور لینک بسازی و مهمون
          چه صفحه‌هایی می‌بینه.
        </p>

        <nav className="mt-8 flex flex-wrap gap-2 text-xs font-bold">
          {[
            ["#intro", "۱ معرفی"],
            ["#signup", "۲ ورود"],
            ["#create", "۳ ساخت لینک"],
            ["#guest", "۴ مهمون"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="rounded-full bg-zinc-100 px-3 py-1.5 text-zinc-700 hover:bg-pink-50 hover:text-pink-600"
            >
              {label}
            </a>
          ))}
        </nav>

        <section id="intro" className="mt-14 scroll-mt-24 space-y-4">
          <h2 className="text-2xl font-bold text-zinc-900">
            ۱. بیا با من چیه؟
          </h2>
          <p className="leading-relaxed text-zinc-600">
            با «بیا با من» برای کسی که دوستش داری یک{" "}
            <strong className="font-bold text-zinc-800">لینک دعوت خصوصی</strong>{" "}
            می‌سازی. طرف مقابل با گوشی باز می‌کنه، جواب می‌ده (بله/نه، تاریخ،
            ساعت، غذا) و تو جواب رو تو داشبوردت می‌بینی — شوخ، فارسی، مخصوص
            موبایل.
          </p>
          <p className="text-sm leading-relaxed text-zinc-500">
            مهمون نیازی به ثبت‌نام نداره؛ فقط لینک رو باز می‌کنه.
          </p>
        </section>

        <section id="signup" className="mt-14 scroll-mt-24 space-y-6">
          <h2 className="text-2xl font-bold text-zinc-900">
            ۲. ثبت‌نام و ورود
          </h2>
          <ol className="list-decimal space-y-2 pr-5 text-sm leading-relaxed text-zinc-600">
            <li>
              برو به{" "}
              <Link href="/signup" className="font-bold text-pink-600">
                ثبت‌نام
              </Link>{" "}
              یا{" "}
              <Link href="/login" className="font-bold text-pink-600">
                ورود
              </Link>
              .
            </li>
            <li>روی دکمهٔ آبی «ورود با حساب کاربری تلگرام» بزن.</li>
            <HelpShot
              src="/help/signup-1.png"
              alt="صفحه ثبت‌نام با دکمه ورود تلگرام"
              caption="۱ — صفحه ثبت‌نام / ورود با تلگرام"
            />
            <li>
              تو صفحهٔ تلگرام، کشور رو روی{" "}
              <strong className="font-bold text-zinc-800">ایران</strong> بگذار و
              همان شماره‌ای رو وارد کن که{" "}
              <strong className="font-bold text-zinc-800">
                تلگرامت باهاش فعاله
              </strong>{" "}
              (معمولاً همان شماره‌ای که اپ تلگرام روش نصب شده). بعد «ادامه» رو
              بزن.
            </li>
            <HelpShot
              src="/help/signup-2.jpg"
              alt="انتخاب ایران و وارد کردن شماره تلگرام"
              caption="۲ — کشور: ایران + شماره‌ای که تلگرام روش فعاله"
            />
            <li>
              تلگرام یک پیام تأیید برات می‌فرسته. اپ تلگرام رو باز کن، پیام رو
              ببین و{" "}
              <strong className="font-bold text-zinc-800">Confirm</strong> بزن؛
              بعد برگرد به همین صفحهٔ مرورگر.
            </li>
            <HelpShot
              src="/help/signup-3.jpg"
              alt="پیام تأیید تلگرام؛ Confirm بزن و برگرد به صفحه"
              caption="۳ — پیام تلگرام → Confirm → برگشت به صفحه"
            />
            <li>بعد از موفقیت برگرد به داشبورد.</li>
          </ol>
          <p className="text-xs leading-relaxed text-zinc-400">
            اگر دکمه نمیاد، فیلترشکن رو روشن کن و صفحه رو رفرش کن. دامنه باید{" "}
            <span dir="ltr">biyabaman.ir</span> باشه.
          </p>
        </section>

        <section id="create" className="mt-14 scroll-mt-24 space-y-4">
          <h2 className="text-2xl font-bold text-zinc-900">
            ۳. ساخت لینک و کپی
          </h2>
          <ol className="list-decimal space-y-2 pr-5 text-sm leading-relaxed text-zinc-600">
            <li>
              تو داشبورد روی{" "}
              <Link href="/dashboard/new" className="font-bold text-pink-600">
                ساخت دعوت‌نامه جدید
              </Link>{" "}
              بزن.
            </li>
            <li>
              نوع لینک رو انتخاب کن:{" "}
              <strong className="font-bold text-zinc-800">لینک با مزه</strong>{" "}
              یا{" "}
              <strong className="font-bold text-zinc-800">دعوت واقعی</strong>.
            </li>
            <li>اسم مهمون رو بنویس.</li>
            <li>اختیاری: متن دعوت، غذا، بازه تاریخ/ساعت، انقضا.</li>
            <li>بساز رو بزن.</li>
            <li>لینک رو با «کپی لینک» بگیر و بفرست.</li>
            <li>
              تو داشبورد وضعیت جواب رو ببین؛ می‌تونی لینک رو فعال/غیرفعال کنی.
            </li>
          </ol>
          <p className="text-xs text-zinc-400">
            عکس‌های این بخش به‌زودی اضافه می‌شه.
          </p>
        </section>

        <section id="guest" className="mt-14 scroll-mt-24 space-y-4">
          <h2 className="text-2xl font-bold text-zinc-900">۴. از نظر مهمون</h2>
          <ol className="list-decimal space-y-2 pr-5 text-sm leading-relaxed text-zinc-600">
            <li>لینک رو باز می‌کنه و دعوت رو می‌بینه.</li>
            <li>بله یا نه می‌زنه.</li>
            <li>اگر بله: تاریخ → ساعت → غذا.</li>
            <li>صفحهٔ تشکر؛ می‌تونه بعداً جواب رو عوض کنه.</li>
          </ol>
          <p className="text-sm leading-relaxed text-zinc-600">
            تو «لینک با مزه» دکمهٔ نه شوخی می‌کنه و کوچیک می‌شه. تو «دعوت واقعی»
            بله و نه هر دو جدی‌ان؛ نه یک تأیید می‌خواد و ثبت می‌شه.
          </p>
          <p className="text-xs text-zinc-400">
            عکس‌های این بخش به‌زودی اضافه می‌شه.
          </p>
        </section>

        <p className="mt-14 text-center">
          <Link
            href="/signup"
            className="inline-flex rounded-full bg-pink-500 px-8 py-3 font-bold text-white hover:bg-pink-600"
          >
            شروع رایگان
          </Link>
        </p>
      </article>
    </MarketingShell>
  );
}
