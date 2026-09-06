import {
  getSessionUser,
  type SessionUser,
} from "@/lib/session";
import { isAdminPasswordAuthenticated } from "@/lib/admin-auth";

export type { SessionUser };

/** Valid user session cookie → user, else null. */
export async function requireUser(): Promise<SessionUser | null> {
  return getSessionUser();
}

/**
 * Logged-in user with Telegram identity (can create invites).
 * Plan D8 / T5: telegram_id required before creating invites.
 */
export async function requireVerified(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user || user.telegram_id == null) return null;
  return user;
}

export type AdminAccess =
  | { via: "session"; user: SessionUser }
  | { via: "password" };

/**
 * Super-admin access (9-7 interim):
 * - Telegram session with `users.is_admin = 1`, or
 * - Legacy `ADMIN_PASSWORD` cookie (`admin_session`)
 */
export async function requireAdmin(): Promise<AdminAccess | null> {
  const user = await getSessionUser();
  if (user?.is_admin) {
    return { via: "session", user };
  }
  if (await isAdminPasswordAuthenticated()) {
    return { via: "password" };
  }
  return null;
}

export async function isAdmin(): Promise<boolean> {
  return (await requireAdmin()) !== null;
}
