import mysql, { Pool } from "mysql2/promise";

let pool: Pool | null = null;

/** Trim; treat missing / blank / quoted-empty as no password. */
function dbPassword(): string {
  const raw = process.env.DATABASE_PASSWORD;
  if (raw == null) return "";
  const p = raw.trim();
  if (p === "" || p === '""' || p === "''") return "";
  return p;
}

export function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DATABASE_HOST || "localhost",
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: dbPassword(),
      waitForConnections: true,
      connectionLimit: 5,
      timezone: "+03:30",
    });
  }
  return pool;
}

/** Call after changing DATABASE_* in the same process (rare; mainly tests). */
export async function resetPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
