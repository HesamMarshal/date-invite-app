import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "./auth-form";

export const metadata: Metadata = {
  title: "ورود",
  description: "وارد حساب کاربری BiyaBaMan شو.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <Link href="/" className="text-sm font-bold text-zinc-500 transition hover:text-pink-500">
        ← برگشت به صفحه اصلی
      </Link>
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <p className="text-4xl">👋</p>
          <h1 className="mt-3 text-2xl font-bold">ورود</h1>
          <p className="mt-2 text-sm text-zinc-500">خوش اومدی! وارد حسابت شو.</p>
        </div>
        <AuthForm mode="login" />
        <p className="text-sm text-zinc-500">
          حساب نداری؟{" "}
          <Link href="/signup" className="font-bold text-pink-500 hover:text-pink-600">
            ثبت‌نام کن
          </Link>
        </p>
      </div>
    </main>
  );
}
