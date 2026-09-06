import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "admin_session";

function hashPassword(pass: string): string {
  return crypto.createHash("sha256").update(pass).digest("hex");
}

function cookieSecure(): boolean {
  return process.env.NODE_ENV === "production";
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || !input) return false;
  const a = Buffer.from(hashPassword(input));
  const b = Buffer.from(hashPassword(expected));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** True if the interim ADMIN_PASSWORD cookie is present and valid. */
export async function isAdminPasswordAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(hashPassword(expected));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** @deprecated Prefer isAdminPasswordAuthenticated or requireAdmin from auth-guards */
export async function isAdminAuthenticated(): Promise<boolean> {
  return isAdminPasswordAuthenticated();
}

export async function setAdminCookie(): Promise<void> {
  const jar = await cookies();
  const hash = hashPassword(process.env.ADMIN_PASSWORD || "");
  jar.set(COOKIE_NAME, hash, {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function clearAdminCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
