import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { getPool } from "./db";
import type { TelegramWidgetUser } from "./telegram-auth";
import { telegramDisplayName } from "./telegram-auth";

export type DbUser = {
  id: number;
  email: string | null;
  phone: string | null;
  telegram_id: number | null;
  telegram_username: string | null;
  display_name: string | null;
  is_admin: boolean;
  plan_tier: string;
};

function mapUser(row: RowDataPacket): DbUser {
  return {
    id: Number(row.id),
    email: row.email ?? null,
    phone: row.phone ?? null,
    telegram_id: row.telegram_id != null ? Number(row.telegram_id) : null,
    telegram_username: row.telegram_username ?? null,
    display_name: row.display_name ?? null,
    is_admin: !!row.is_admin,
    plan_tier: String(row.plan_tier || "free"),
  };
}

export async function findUserByTelegramId(
  telegramId: number
): Promise<DbUser | null> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, email, phone, telegram_id, telegram_username, display_name,
            is_admin, plan_tier
       FROM users
      WHERE telegram_id = ?
      LIMIT 1`,
    [telegramId]
  );
  return rows[0] ? mapUser(rows[0]) : null;
}

/**
 * Find by telegram_id or insert a new Telegram-only user.
 * Updates username / display_name on returning users.
 */
export async function upsertUserFromTelegram(
  tg: TelegramWidgetUser
): Promise<DbUser> {
  const pool = getPool();
  const displayName = telegramDisplayName(tg);
  const username = tg.username ?? null;

  const existing = await findUserByTelegramId(tg.id);
  if (existing) {
    await pool.query(
      `UPDATE users
          SET telegram_username = ?,
              display_name = ?
        WHERE id = ?`,
      [username, displayName, existing.id]
    );
    return {
      ...existing,
      telegram_username: username,
      display_name: displayName,
    };
  }

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO users (
       telegram_id, telegram_username, display_name, password_hash, plan_tier
     ) VALUES (?, ?, ?, NULL, 'free')`,
    [tg.id, username, displayName]
  );

  const user = await findUserByTelegramId(tg.id);
  if (!user) {
    // Fallback if insert raced; should be rare
    throw new Error(`user_insert_failed:${result.insertId}`);
  }
  return user;
}

export type UserWithStats = DbUser & {
  invite_count: number;
  created_at: string | null;
};

export async function listUsersWithStats(): Promise<UserWithStats[]> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT u.id, u.email, u.phone, u.telegram_id, u.telegram_username,
            u.display_name, u.is_admin, u.plan_tier, u.created_at,
            COUNT(i.id) AS invite_count
       FROM users u
       LEFT JOIN invitations i
         ON i.user_id = u.id AND i.deleted_at IS NULL
      GROUP BY u.id
      ORDER BY u.created_at DESC`
  );
  return rows.map((row) => ({
    ...mapUser(row),
    invite_count: Number(row.invite_count ?? 0),
    created_at: row.created_at ? String(row.created_at) : null,
  }));
}

export async function updateUserPlanTier(
  userId: number,
  planTier: string
): Promise<boolean> {
  const pool = getPool();
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE users SET plan_tier = ? WHERE id = ?`,
    [planTier, userId]
  );
  return result.affectedRows > 0;
}
