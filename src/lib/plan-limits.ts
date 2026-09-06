import { getPool } from "./db";
import { RowDataPacket } from "mysql2/promise";

export type PlanLimits = {
  slug: string;
  max_active: number;
  max_monthly_creates: number;
};

export type PlanLimitBlock =
  | { ok: true }
  | { ok: false; error: "limit_active" | "limit_monthly" };

export async function getPlanLimits(
  slug: string
): Promise<PlanLimits | null> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT slug, max_active, max_monthly_creates
       FROM plan_types
      WHERE slug = ?
      LIMIT 1`,
    [slug]
  );
  const row = rows[0];
  if (!row) return null;
  return {
    slug: String(row.slug),
    max_active: Number(row.max_active),
    max_monthly_creates: Number(row.max_monthly_creates),
  };
}

export async function countActiveInvitesForUser(
  userId: number
): Promise<number> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS c
       FROM invitations
      WHERE user_id = ?
        AND is_active = 1
        AND deleted_at IS NULL
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

/** Enforce plan_types caps. Missing slug fails closed. */
export async function checkCreateLimits(
  userId: number,
  planTier: string
): Promise<PlanLimitBlock> {
  const limits = await getPlanLimits(planTier);
  if (!limits) return { ok: false, error: "limit_active" };

  const [active, monthly] = await Promise.all([
    countActiveInvitesForUser(userId),
    countMonthlyCreatesForUser(userId),
  ]);

  if (active >= limits.max_active) {
    return { ok: false, error: "limit_active" };
  }
  if (monthly >= limits.max_monthly_creates) {
    return { ok: false, error: "limit_monthly" };
  }
  return { ok: true };
}
