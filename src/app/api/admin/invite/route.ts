import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createInvitation } from "@/lib/invite-queries";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { recipientName, expiresAt } = await request.json();

  if (!recipientName || typeof recipientName !== "string") {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }

  const token = await createInvitation(recipientName.trim(), expiresAt || null);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://invite.hesammarshal.ir";
  const url = `${appUrl}/i/${token}`;

  return NextResponse.json({ token, url });
}
