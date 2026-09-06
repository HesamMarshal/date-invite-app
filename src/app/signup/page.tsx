import type { Metadata } from "next";
import { redirect } from "next/navigation";
import TelegramAuthScreen from "@/components/telegram-auth-screen";
import { getSessionUser } from "@/lib/session";
import { getTelegramBotUsername } from "@/lib/telegram-auth";

export const metadata: Metadata = {
  title: "ثبت‌نام",
  description: "با تلگرام حساب رایگان BiyaBaMan بساز.",
  robots: { index: false, follow: false },
};

export default async function SignupPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <TelegramAuthScreen
      botUsername={getTelegramBotUsername()}
      variant="signup"
      localHint={!(process.env.NEXT_PUBLIC_APP_URL || "").startsWith("https://")}
    />
  );
}
