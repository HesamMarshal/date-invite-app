import SiteHeader from "@/components/site-header";
import { requireUser } from "@/lib/auth-guards";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip">
      <SiteHeader area="dashboard" loggedIn isAdmin={user.is_admin} />
      {children}
    </div>
  );
}
