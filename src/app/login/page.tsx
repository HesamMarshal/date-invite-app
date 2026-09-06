import type { Metadata } from "next";
import { redirect } from "next/navigation";
import TelegramAuthScreen from "@/components/telegram-auth-screen";
import { getSessionUser } from "@/lib/session";
import { getTelegramBotUsername } from "@/lib/telegram-auth";

export const metadata: Metadata = {
  title: "ورود",
  description: "با تلگرام وارد حساب BiyaBaMan شو.",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <TelegramAuthScreen
      botUsername={getTelegramBotUsername()}
      variant="login"
      localHint={!(process.env.NEXT_PUBLIC_APP_URL || "").startsWith("https://")}
    />
  );
}
