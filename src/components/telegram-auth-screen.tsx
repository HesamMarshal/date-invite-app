import Link from "next/link";
import TelegramLoginWidget from "@/components/telegram-login-widget";

type Props = {
  botUsername: string | null;
  /** Same screen for login + signup — only copy differs slightly. */
  variant?: "login" | "signup";
  /** Widget needs HTTPS + BotFather domain — warn on local HTTP. */
  localHint?: boolean;
};

export default function TelegramAuthScreen({
  botUsername,
  variant = "login",
  localHint = false,
}: Props) {
  const isSignup = variant === "signup";

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-6 p-8"
      dir="rtl"
    >
      <Link
        href="/"
        className="text-sm font-bold text-zinc-500 transition hover:text-pink-500"
      >
        ← برگشت به صفحه اصلی
      </Link>
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <p className="text-4xl">{isSignup ? "✨" : "👋"}</p>
          <h1 className="mt-3 text-2xl font-bold">
            {isSignup ? "ثبت‌نام" : "ورود"}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">با تلگرام وارد شو</p>
        </div>

        {localHint && (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-center text-xs leading-relaxed text-amber-800">
            دکمه تلگرام روی localhost کار نمی‌کنه — برای تست واقعی برو به{" "}
            <span className="font-bold" dir="ltr">
              https://biyabaman.ir
            </span>
          </p>
        )}

        <TelegramLoginWidget botUsername={botUsername} />

        <p className="text-sm text-zinc-500">
          {isSignup ? (
            <>
              قبلاً اومدی؟{" "}
              <Link
                href="/login"
                className="font-bold text-pink-500 hover:text-pink-600"
              >
                ورود
              </Link>
            </>
          ) : (
            <>
              اولین باره؟{" "}
              <Link
                href="/signup"
                className="font-bold text-pink-500 hover:text-pink-600"
              >
                ثبت‌نام
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
