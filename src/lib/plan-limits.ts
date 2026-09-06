import { getPool } from "./db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export type PlanLimits = {
  slug: string;
  max_active: number;
  max_monthly_creates: number;
};

export type PlanLimitBlock =
  | { ok: true }
  | { ok: false; error: "limit_active" | "limit_monthly" };

const SLUG_RE = /^[a-z][a-z0-9_]{0,31}$/;

export function isValidPlanSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}

export async function listPlanTypes(): Promise<PlanLimits[]> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT slug, max_active, max_monthly_creates
       FROM plan_types
      ORDER BY slug ASC`
  );
  return rows.map((row) => ({
    slug: String(row.slug),
    max_active: Number(row.max_active),
    max_monthly_creates: Number(row.max_monthly_creates),
  }));
}

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

/** Owner plan_tier for an invitation (guest branding). Missing → free. */
export async function getPlanTierForUserId(
  userId: number | null | undefined
): Promise<string> {
  if (userId == null) return "free";
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT plan_tier FROM users WHERE id = ? LIMIT 1`,
    [userId]
  );
  return String(rows[0]?.plan_tier || "free");
}

export async function createPlanType(
  slug: string,
  maxActive: number,
  maxMonthlyCreates: number
): Promise<void> {
  const pool = getPool();
  await pool.query<ResultSetHeader>(
    `INSERT INTO plan_types (slug, max_active, max_monthly_creates)
     VALUES (?, ?, ?)`,
    [slug, maxActive, maxMonthlyCreates]
  );
}

export async function updatePlanTypeCaps(
  slug: string,
  maxActive: number,
  maxMonthlyCreates: number
): Promise<boolean> {
  const pool = getPool();
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE plan_types
        SET max_active = ?, max_monthly_creates = ?
      WHERE slug = ?`,
    [maxActive, maxMonthlyCreates, slug]
  );
  return result.affectedRows > 0;
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
