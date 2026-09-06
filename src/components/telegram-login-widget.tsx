"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type TelegramAuthUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramAuthUser) => void;
  }
}

type Props = {
  botUsername: string | null;
};

export default function TelegramLoginWidget({ botUsername }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!botUsername || !hostRef.current) return;

    const host = hostRef.current;
    host.innerHTML = "";

    window.onTelegramAuth = async (user: TelegramAuthUser) => {
      setError("");
      setLoading(true);
      try {
        const res = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          if (data.error === "rate_limited") {
            setError("زیاد تلاش کردی، یکم صبر کن.");
          } else if (data.error === "config" || data.error === "db_config") {
            setError("ورود با تلگرام روی سرور تنظیم نشده.");
          } else if (data.error === "db_schema") {
            setError("دیتابیس ناقصه — install.sql رو روی دیتابیس فعلی اجرا کن.");
          } else if (data.error === "db_connect") {
            setError("اتصال به دیتابیس برقرار نشد. تنظیمات DATABASE_* رو چک کن.");
          } else if (
            data.error === "server_error" ||
            data.error === "db_error"
          ) {
            setError("خطای سرور. کمی بعد دوباره امتحان کن.");
          } else {
            setError("ورود انجام نشد. دوباره امتحان کن.");
          }
          setLoading(false);
          return;
        }
        router.replace("/dashboard");
        router.refresh();
      } catch {
        setError("ارتباط با سرور برقرار نشد");
        setLoading(false);
      }
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-lang", "fa");
    script.setAttribute("data-userpic", "false");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    host.appendChild(script);

    return () => {
      delete window.onTelegramAuth;
      host.innerHTML = "";
    };
  }, [botUsername, router]);

  if (!botUsername) {
    return (
      <p className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
        ورود با تلگرام هنوز تنظیم نشده.
      </p>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div
        ref={hostRef}
        className="flex min-h-[44px] w-full items-center justify-center"
      />
      {loading && <p className="text-sm text-zinc-500">در حال ورود...</p>}
      {error && <p className="text-center text-sm text-red-500">{error}</p>}
      <p className="max-w-xs text-center text-xs leading-relaxed text-zinc-400">
        اگر دکمه نمیاد، فیلترشکن رو روشن کن و صفحه رو رفرش کن
      </p>
    </div>
  );
}
