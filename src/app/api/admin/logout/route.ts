import { NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/admin-auth";
import { clearSession } from "@/lib/session";

/** Clear leftover password cookie + user session. */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  await clearSession(response);
  await clearAdminCookie();
  return response;
}
