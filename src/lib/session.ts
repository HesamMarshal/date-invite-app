import crypto from "crypto";
import { cookies } from "next/headers";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { getPool } from "./db";

const COOKIE_NAME = "user_session";
const SESSION_DAYS = 30;
const SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60; // seconds

export type SessionUser = {
  id: number;
  email: string | null;
  phone: string | null;
  telegram_id: number | null;
  telegram_username: string | null;
  display_name: string | null;
  is_admin: boolean;
  plan_tier: "free" | "pro";
};

function newSessionId(): string {
  return crypto.randomBytes(32).toString("hex"); // 64 chars
}

function cookieSecure(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Insert session row + set HttpOnly cookie (30 days). */
export async function createSession(userId: number): Promise<string> {
  const id = newSessionId();
  const pool = getPool();

  await pool.query<ResultSetHeader>(
    `INSERT INTO sessions (id, user_id, expires_at)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
    [id, userId, SESSION_DAYS]
  );

  const jar = await cookies();
  jar.set(COOKIE_NAME, id, {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return id;
}

/** Load user for a valid (non-expired) session cookie. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const sessionId = jar.get(COOKIE_NAME)?.value;
  if (!sessionId || !/^[0-9a-f]{64}$/i.test(sessionId)) return null;

  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT u.id, u.email, u.phone, u.telegram_id, u.telegram_username,
            u.display_name, u.is_admin, u.plan_tier
       FROM sessions s
       INNER JOIN users u ON u.id = s.user_id
      WHERE s.id = ?
        AND s.expires_at > NOW()
      LIMIT 1`,
    [sessionId]
  );

  const row = rows[0];
  if (!row) return null;

  return {
    id: Number(row.id),
    email: row.email ?? null,
    phone: row.phone ?? null,
    telegram_id: row.telegram_id != null ? Number(row.telegram_id) : null,
    telegram_username: row.telegram_username ?? null,
    display_name: row.display_name ?? null,
    is_admin: !!row.is_admin,
    plan_tier: row.plan_tier === "pro" ? "pro" : "free",
  };
}

/** Delete session row (if any) and clear cookie. */
export async function clearSession(): Promise<void> {
  const jar = await cookies();
  const sessionId = jar.get(COOKIE_NAME)?.value;

  if (sessionId) {
    const pool = getPool();
    await pool.query("DELETE FROM sessions WHERE id = ?", [sessionId]);
  }

  jar.delete(COOKIE_NAME);
}

/** True if a valid user session cookie is present. */
export async function requireUser(): Promise<SessionUser | null> {
  return getSessionUser();
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE;
