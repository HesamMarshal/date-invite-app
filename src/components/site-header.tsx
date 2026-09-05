import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-100/80 bg-[#fafafa]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-xl font-bold text-zinc-900">
          💌 بیا با من
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          <Link
            href="/contact"
            className="rounded-full px-3 py-2 text-sm font-bold text-zinc-600 transition hover:bg-zinc-100 sm:px-4"
          >
            تماس با ما
          </Link>
          <Link
            href="/login"
            className="rounded-full px-3 py-2 text-sm font-bold text-zinc-700 transition hover:bg-zinc-100 sm:px-4"
          >
            ورود
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-pink-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-pink-600 sm:px-4"
          >
            ثبت‌نام
          </Link>
        </nav>
      </div>
    </header>
  );
}
