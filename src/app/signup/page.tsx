import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "../login/auth-form";

export const metadata: Metadata = {
  title: "ثبت‌نام",
  description: "حساب رایگان BiyaBaMan بساز و دعوت‌نامه ارسال کن.",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <Link href="/" className="text-sm font-bold text-zinc-500 transition hover:text-pink-500">
        ← برگشت به صفحه اصلی
      </Link>
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <p className="text-4xl">✨</p>
          <h1 className="mt-3 text-2xl font-bold">ثبت‌نام</h1>
          <p className="mt-2 text-sm text-zinc-500">چند ثانیه طول می‌کشه — بعدش شروع می‌کنی.</p>
        </div>
        <AuthForm mode="signup" />
        <p className="text-sm text-zinc-500">
          قبلاً ثبت‌نام کردی؟{" "}
          <Link href="/login" className="font-bold text-pink-500 hover:text-pink-600">
            وارد شو
          </Link>
        </p>
      </div>
    </main>
  );
}
