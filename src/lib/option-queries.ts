import { getPool } from "./db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export interface InviteOption {
  id: number;
  emoji: string;
  label: string;
  sort_order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export type InviteOptionChoice = Pick<InviteOption, "id" | "emoji" | "label">;

export async function listInviteOptions(
  activeOnly = false
): Promise<InviteOption[]> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    activeOnly
      ? `SELECT * FROM invite_options WHERE is_active = 1 ORDER BY sort_order ASC, id ASC`
      : `SELECT * FROM invite_options ORDER BY sort_order ASC, id ASC`
  );
  return rows as InviteOption[];
}

export async function getOptionsForInvitation(
  invitationId: number
): Promise<InviteOptionChoice[]> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT o.id, o.emoji, o.label
       FROM invitation_options io
       JOIN invite_options o ON o.id = io.option_id
      WHERE io.invitation_id = ?
      ORDER BY o.sort_order ASC, o.id ASC`,
    [invitationId]
  );
  return rows as InviteOptionChoice[];
}

export async function isFoodChoiceAllowed(
  invitationId: number,
  label: string
): Promise<boolean> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT 1
       FROM invitation_options io
       JOIN invite_options o ON o.id = io.option_id
      WHERE io.invitation_id = ? AND o.label = ?
      LIMIT 1`,
    [invitationId, label]
  );
  return rows.length > 0;
}

export async function createInviteOption(input: {
  emoji: string;
  label: string;
  sortOrder?: number;
}): Promise<number> {
  const pool = getPool();
  let sortOrder = input.sortOrder;
  if (sortOrder === undefined) {
    const [maxRows] = await pool.query<RowDataPacket[]>(
      "SELECT COALESCE(MAX(sort_order), 0) AS m FROM invite_options"
    );
    sortOrder = Number(maxRows[0]?.m ?? 0) + 1;
  }
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO invite_options (emoji, label, sort_order, is_active)
     VALUES (?, ?, ?, 1)`,
    [input.emoji, input.label, sortOrder]
  );
  return result.insertId;
}

export async function updateInviteOption(
  id: number,
  input: { emoji: string; label: string; sortOrder: number; isActive: boolean }
): Promise<boolean> {
  const pool = getPool();
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE invite_options
        SET emoji = ?, label = ?, sort_order = ?, is_active = ?
      WHERE id = ?`,
    [input.emoji, input.label, input.sortOrder, input.isActive ? 1 : 0, id]
  );
  return result.affectedRows > 0;
}

export async function deactivateInviteOption(id: number): Promise<boolean> {
  const pool = getPool();
  const [result] = await pool.query<ResultSetHeader>(
    "UPDATE invite_options SET is_active = 0 WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
}

/** Hard delete only if unused; otherwise soft-deactivate. */
export async function removeInviteOption(
  id: number
): Promise<"deleted" | "deactivated" | "not_found"> {
  const pool = getPool();
  const [used] = await pool.query<RowDataPacket[]>(
    "SELECT 1 FROM invitation_options WHERE option_id = ? LIMIT 1",
    [id]
  );
  if (used.length > 0) {
    const ok = await deactivateInviteOption(id);
    return ok ? "deactivated" : "not_found";
  }
  const [result] = await pool.query<ResultSetHeader>(
    "DELETE FROM invite_options WHERE id = ?",
    [id]
  );
  if (result.affectedRows === 0) return "not_found";
  return "deleted";
}

export async function countActiveOptionsByIds(ids: number[]): Promise<number> {
  if (ids.length === 0) return 0;
  const pool = getPool();
  const placeholders = ids.map(() => "?").join(",");
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS c FROM invite_options
      WHERE is_active = 1 AND id IN (${placeholders})`,
    ids
  );
  return Number(rows[0]?.c ?? 0);
}
