import {
  getSessionUser,
  type SessionUser,
} from "@/lib/session";

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

/**
 * Super-admin (14-2): Telegram session with `users.is_admin = 1` only.
 * ADMIN_PASSWORD gate removed.
 */
export async function requireAdmin(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (user?.is_admin) return user;
  return null;
}

export async function isAdmin(): Promise<boolean> {
  return (await requireAdmin()) !== null;
}
