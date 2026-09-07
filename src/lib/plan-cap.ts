import { toPersianDigits } from "./datetime";

/** Sentinel in `plan_types` caps: no limit for that column. */
export const UNLIMITED_CAP = -1;

export function isUnlimitedCap(n: number): boolean {
  return n === UNLIMITED_CAP;
}

/** Cap is `-1` (unlimited) or an integer ≥ 1. */
export function isValidPlanCap(n: number): boolean {
  return Number.isInteger(n) && (n === UNLIMITED_CAP || n >= 1);
}

export function parsePlanCap(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!isValidPlanCap(n)) return null;
  return n;
}

export function formatPlanCapFa(n: number): string {
  return isUnlimitedCap(n) ? "بدون سقف" : toPersianDigits(n);
}
