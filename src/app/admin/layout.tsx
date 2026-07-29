import { isAdminAuthenticated } from "@/lib/admin-auth";
import AdminLogin from "./admin-login";

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
