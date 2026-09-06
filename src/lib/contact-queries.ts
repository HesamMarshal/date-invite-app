import { getPool } from "./db";
import { ResultSetHeader } from "mysql2/promise";

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
