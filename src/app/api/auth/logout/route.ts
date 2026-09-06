import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

/** POST /api/auth/logout — delete session row + clear cookie. */
export async function POST() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
