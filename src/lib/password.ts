import bcrypt from "bcrypt";

/** Cost factor — 12 is a solid default for shared hosting + security balance */
const BCRYPT_ROUNDS = 12;

/**
 * Hash a plain password for storage in `users.password_hash`.
 * Never store or log the plain password.
 */
export async function hashPassword(plain: string): Promise<string> {
  if (!plain || plain.length < 8) {
    throw new Error("password_too_short");
  }
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/**
 * Compare plain password to a bcrypt hash from the database.
 * Returns false for missing hash or placeholder seed hashes.
 */
export async function verifyPassword(
  plain: string,
  passwordHash: string | null | undefined
): Promise<boolean> {
  if (!plain || !passwordHash) return false;
  // Seed placeholder from Phase 1 — not a real bcrypt hash
  if (!passwordHash.startsWith("$2")) return false;

  try {
    return await bcrypt.compare(plain, passwordHash);
  } catch {
    return false;
  }
}
