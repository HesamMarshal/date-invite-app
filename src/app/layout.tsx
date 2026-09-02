import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BiyaBaMan",
    template: "%s | BiyaBaMan",
  },
  description: "لینک دعوت‌نامه بفرست، جواب رو ببین — تجربه شوخ و فارسی برای دعوت به قرار.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#fafafa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="h-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
