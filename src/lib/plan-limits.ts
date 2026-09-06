import { getPool } from "./db";
import { RowDataPacket } from "mysql2/promise";

/** Free tier (plan matrix): simultaneous non-expired invites. */
export const FREE_MAX_ACTIVE_INVITES = 3;

/** Free tier: creates per calendar month (server local month). */
export const FREE_MAX_MONTHLY_CREATES = 5;

export type FreeLimitBlock =
  | { ok: true }
  | { ok: false; error: "limit_active" | "limit_monthly" };

export async function countActiveInvitesForUser(
  userId: number
): Promise<number> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS c
       FROM invitations
      WHERE user_id = ?
        AND (expires_at IS NULL OR expires_at > NOW())`,
    [userId]
  );
  return Number(rows[0]?.c ?? 0);
}

export async function countMonthlyCreatesForUser(
  userId: number
): Promise<number> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS c
       FROM invitations
      WHERE user_id = ?
        AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')`,
    [userId]
  );
  return Number(rows[0]?.c ?? 0);
}

/** Enforce free-tier caps; Pro skips. */
export async function checkFreeCreateLimits(
  userId: number,
  planTier: "free" | "pro"
): Promise<FreeLimitBlock> {
  if (planTier === "pro") return { ok: true };

  const [active, monthly] = await Promise.all([
    countActiveInvitesForUser(userId),
    countMonthlyCreatesForUser(userId),
  ]);

  if (active >= FREE_MAX_ACTIVE_INVITES) {
    return { ok: false, error: "limit_active" };
  }
  if (monthly >= FREE_MAX_MONTHLY_CREATES) {
    return { ok: false, error: "limit_monthly" };
  }
  return { ok: true };
}
