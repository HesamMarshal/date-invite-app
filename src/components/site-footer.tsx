import Link from "next/link";
import { getSiteContact } from "@/lib/site-contact";

export default function SiteFooter() {
  const contact = getSiteContact();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-100 bg-white">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1 text-sm text-zinc-600">
            <p className="font-bold text-zinc-900">{contact.brandFa}</p>
            <p>{contact.address}</p>
            {contact.landline ? (
              <p>
                تلفن ثابت:{" "}
                <a
                  href={`tel:${contact.landline.replace(/\s/g, "")}`}
                  className="text-zinc-800 underline-offset-2 hover:underline"
                  dir="ltr"
                >
                  {contact.landline}
                </a>
              </p>
            ) : null}
            <p>
              موبایل:{" "}
              <a
                href={`tel:${contact.mobile.replace(/\s/g, "")}`}
                className="text-zinc-800 underline-offset-2 hover:underline"
                dir="ltr"
              >
                {contact.mobile}
              </a>
            </p>
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
          </div>
          <nav className="flex flex-col gap-2 text-sm font-bold text-zinc-700 sm:items-end">
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
