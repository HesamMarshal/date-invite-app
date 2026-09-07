import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { getSessionUser } from "@/lib/session";

export default async function MarketingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  let loggedIn = false;
  let isAdmin = false;
  try {
    const user = await getSessionUser();
    loggedIn = Boolean(user);
    isAdmin = Boolean(user?.is_admin);
  } catch {
    loggedIn = false;
    isAdmin = false;
  }

  return (
    <div className="flex min-h-screen min-w-0 max-w-full flex-col overflow-x-clip">
      <SiteHeader area="public" loggedIn={loggedIn} isAdmin={isAdmin} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
