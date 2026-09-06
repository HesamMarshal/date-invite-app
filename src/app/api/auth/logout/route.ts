import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

/** POST /api/auth/logout — delete session row + clear cookie. */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  await clearSession(response);
  return response;
}
