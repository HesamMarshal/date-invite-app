import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import AdminLogin from "./admin-login";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return <AdminLogin />;
  }

  return <>{children}</>;
}
