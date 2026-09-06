import type { Metadata } from "next";
import MarketingShell from "@/components/marketing-shell";
import { getSiteContact } from "@/lib/site-contact";
import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "ارتباط با ما",
  description: "پیام بفرست یا با ایمیل برند بیا با من در تماس باش.",
};

export default function ContactPage() {
  const c = getSiteContact();

  return (
    <MarketingShell>
      <article className="mx-auto max-w-lg px-6 py-14">
        <h1 className="text-3xl font-bold">ارتباط با ما</h1>
        <p className="mt-3 text-zinc-600 leading-relaxed">
          برای پشتیبانی یا پیشنهاد، فرم رو پر کن. سعی می‌کنیم زود جواب بدیم.
        </p>

        <div className="mt-8">
          <ContactForm />
        </div>

        {c.email ? (
          <p className="mt-8 text-center text-sm text-zinc-500">
            یا مستقیم به{" "}
            <a
              href={`mailto:${c.email}`}
              className="font-bold text-pink-600 hover:underline"
              dir="ltr"
            >
              {c.email}
            </a>
          </p>
        ) : null}
      </article>
    </MarketingShell>
  );
}
