import Link from "next/link";
import { getSiteContact } from "@/lib/site-contact";

/** Free-tier branding on guest invite; hide when owner is Pro (13-3). */
export default function InviteBrandFooter({ show }: { show: boolean }) {
  if (!show) return null;
  const c = getSiteContact();

  return (
    <p className="pb-8 pt-4 text-center text-xs text-zinc-400">
      ساخته‌شده با{" "}
      <Link
        href={c.siteUrl}
        className="font-medium text-pink-500 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        💌 {c.brandFa}
      </Link>
    </p>
  );
}
