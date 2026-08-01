import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createInvitation } from "@/lib/invite-queries";
import { normalizeInviteText } from "@/lib/invite-defaults";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { recipientName, inviteText, expiresAt } = body;

  if (!recipientName || typeof recipientName !== "string") {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }

  if (recipientName.trim().length > 100) {
    return NextResponse.json({ error: "name_too_long" }, { status: 400 });
  }

  if (typeof inviteText === "string" && inviteText.trim().length > 200) {
    return NextResponse.json({ error: "invite_text_too_long" }, { status: 400 });
  }

  let parsedExpiry: string | null = null;
  if (expiresAt && typeof expiresAt === "string") {
    if (isNaN(new Date(expiresAt).getTime())) {
      return NextResponse.json({ error: "invalid_expiry" }, { status: 400 });
    }
    parsedExpiry = expiresAt;
  }

  const token = await createInvitation(
    recipientName.trim(),
    normalizeInviteText(inviteText),
    parsedExpiry
  );
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://invite.hesammarshal.ir";
  const url = `${appUrl}/i/${token}`;

  return NextResponse.json({ token, url });
}
