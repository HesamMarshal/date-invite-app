import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "admin_session";

function hashPassword(pass: string): string {
  return crypto.createHash("sha256").update(pass).digest("hex");
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return false;
  return crypto.timingSafeEqual(
    Buffer.from(hashPassword(input)),
    Buffer.from(hashPassword(expected))
  );
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const expected = hashPassword(process.env.ADMIN_PASSWORD || "");
  return token === expected;
}

export async function setAdminCookie(): Promise<void> {
  const jar = await cookies();
  const hash = hashPassword(process.env.ADMIN_PASSWORD || "");
  jar.set(COOKIE_NAME, hash, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function clearAdminCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
