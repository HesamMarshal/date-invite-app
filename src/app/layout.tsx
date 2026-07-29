import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Invite",
  description: "با من سر قرار میای؟",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        {children}
      </body>
    </html>
  );
}
