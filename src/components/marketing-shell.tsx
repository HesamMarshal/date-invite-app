import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { getSessionUser } from "@/lib/session";

export default async function MarketingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  let loggedIn = false;
  try {
    loggedIn = Boolean(await getSessionUser());
  } catch {
    loggedIn = false;
  }

  return (
    <div className="flex min-h-screen min-w-0 max-w-full flex-col overflow-x-clip">
      <SiteHeader loggedIn={loggedIn} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
