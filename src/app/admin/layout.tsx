import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guards";
import AdminLogin from "./admin-login";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * /admin gate (9-7):
 * - ADMIN_PASSWORD cookie (interim), or
 * - Telegram user session with is_admin = 1
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await requireAdmin();

  if (!access) {
    return <AdminLogin />;
  }

  return <>{children}</>;
}
