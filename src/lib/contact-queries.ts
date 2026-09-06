import { getPool } from "./db";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export type ContactMessageInput = {
  name: string;
  contact: string;
  message: string;
  ip: string | null;
};

export async function insertContactMessage(
  input: ContactMessageInput
): Promise<number> {
  const pool = getPool();
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO contact_messages (name, contact, message, ip)
     VALUES (?, ?, ?, ?)`,
    [input.name, input.contact, input.message, input.ip]
  );
  return result.insertId;
}

export type ContactMessageRow = {
  id: number;
  name: string;
  contact: string;
  message: string;
  ip: string | null;
  created_at: string;
};

export async function listContactMessages(
  limit = 100
): Promise<ContactMessageRow[]> {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, name, contact, message, ip, created_at
       FROM contact_messages
      ORDER BY created_at DESC
      LIMIT ?`,
    [limit]
  );
  return rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    contact: String(row.contact),
    message: String(row.message),
    ip: row.ip != null ? String(row.ip) : null,
    created_at: String(row.created_at),
  }));
}
