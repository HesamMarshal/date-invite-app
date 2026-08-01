import crypto from "crypto";
import { getPool } from "./db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export interface Invitation {
  id: number;
  token: string;
  recipient_name: string;
  invite_text: string;
  opened_at: string | null;
  open_count: number;
  expires_at: string | null;
  created_at: string;
}

export interface InviteResponse {
  id: number;
  invitation_id: number;
  accepted: boolean;
  selected_datetime: string | null;
  food_choice: string | null;
  created_at: string;
  updated_at: string;
}

export async function getInvitationByToken(
  token: string
): Promise<Invitation | null> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM invitations WHERE token = ? LIMIT 1",
    [token]
  );
  return (rows[0] as Invitation) ?? null;
}

export async function recordOpen(id: number): Promise<void> {
  const pool = getPool();
  await pool.query(
    `UPDATE invitations
       SET open_count = open_count + 1,
           opened_at = COALESCE(opened_at, NOW())
     WHERE id = ?`,
    [id]
  );
}

export async function getResponseByInvitationId(
  invitationId: number
): Promise<InviteResponse | null> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM responses WHERE invitation_id = ? LIMIT 1",
    [invitationId]
  );
  return (rows[0] as InviteResponse) ?? null;
}

export async function upsertResponse(
  invitationId: number,
  accepted: boolean,
  selectedDatetime: string | null,
  foodChoice: string | null
): Promise<void> {
  const pool = getPool();
  await pool.query<ResultSetHeader>(
    `INSERT INTO responses (invitation_id, accepted, selected_datetime, food_choice)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       accepted = VALUES(accepted),
       selected_datetime = VALUES(selected_datetime),
       food_choice = VALUES(food_choice),
       updated_at = NOW()`,
    [invitationId, accepted ? 1 : 0, selectedDatetime, foodChoice]
  );
}

export interface InvitationWithResponse extends Invitation {
  accepted: number | null;
  selected_datetime: string | null;
  food_choice: string | null;
  response_updated_at: string | null;
}

export async function getAllInvitationsWithResponses(): Promise<
  InvitationWithResponse[]
> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT i.*,
            r.accepted,
            r.selected_datetime,
            r.food_choice,
            r.updated_at AS response_updated_at
       FROM invitations i
       LEFT JOIN responses r ON r.invitation_id = i.id
      ORDER BY i.created_at DESC`
  );
  return rows as InvitationWithResponse[];
}

function generateToken(length = 16): string {
  return crypto.randomBytes(length).toString("base64url").slice(0, length);
}

export async function createInvitation(
  recipientName: string,
  inviteText: string,
  expiresAt: string | null
): Promise<string> {
  const pool = getPool();
  const token = generateToken();
  await pool.query<ResultSetHeader>(
    `INSERT INTO invitations (token, recipient_name, invite_text, expires_at) VALUES (?, ?, ?, ?)`,
    [token, recipientName, inviteText, expiresAt || null]
  );
  return token;
}

export async function deleteInvitation(id: number): Promise<boolean> {
  const pool = getPool();
  const [result] = await pool.query<ResultSetHeader>(
    "DELETE FROM invitations WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
}
