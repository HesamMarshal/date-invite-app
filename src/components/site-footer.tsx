import Link from "next/link";
import { getSiteContact } from "@/lib/site-contact";

/**
 * Marketing footer (13-3 + 13-5-1): brand + optional public email only.
 * No personal mobile / address / Telegram.
 * Free-tier attribution always on marketing pages; Pro hide = guest invite only.
 */
export default function SiteFooter() {
  const contact = getSiteContact();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-100 bg-white">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1 text-sm text-zinc-600">
            <p className="font-bold text-zinc-900">{contact.brandFa}</p>
            <p className="text-zinc-500" dir="ltr">
              {contact.siteUrl.replace(/^https?:\/\//, "")}
            </p>
            {contact.email ? (
              <p>
                ایمیل:{" "}
                <a
                  href={`mailto:${contact.email}`}
                  className="text-zinc-800 underline-offset-2 hover:underline"
                  dir="ltr"
                >
                  {contact.email}
                </a>
              </p>
            ) : null}
            <p className="pt-2 text-xs text-zinc-400">
              ساخته‌شده با 💌 {contact.brandFa}
            </p>
          </div>
          <nav className="flex flex-col gap-2 text-sm font-bold text-zinc-700 sm:items-end">
            <Link href="/help" className="hover:text-pink-500">
              راهنما
            </Link>
            <Link href="/contact" className="hover:text-pink-500">
              ارتباط با ما
            </Link>
            <Link href="/terms" className="hover:text-pink-500">
              قوانین استفاده
            </Link>
            <Link href="/privacy" className="hover:text-pink-500">
              حریم خصوصی
            </Link>
          </nav>
        </div>
        <p className="text-center text-sm text-zinc-400">
          © {year} {contact.brandFa}
        </p>
      </div>
    </footer>
  );
}
