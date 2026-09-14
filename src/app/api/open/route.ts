import { NextRequest, NextResponse } from "next/server";
import {
  getInvitationByToken,
  getResponseByInvitationId,
  recordOpen,
} from "@/lib/invite-queries";

/** Guest landed on the yes/no screen. After accept, further opens do not count. */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const token = typeof body.token === "string" ? body.token : "";
  if (!token) return NextResponse.json({ ok: true });

  const invite = await getInvitationByToken(token);
  if (!invite || !invite.is_active) return NextResponse.json({ ok: true });
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ ok: true });
  }

  const existing = await getResponseByInvitationId(invite.id);
  if (existing?.accepted) return NextResponse.json({ ok: true });

  await recordOpen(invite.id);
  return NextResponse.json({ ok: true });
}
