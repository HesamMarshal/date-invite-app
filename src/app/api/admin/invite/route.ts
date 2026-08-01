import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createInvitation, deleteInvitation } from "@/lib/invite-queries";
import { normalizeInviteText } from "@/lib/invite-defaults";
import { isValidMysqlDatetime } from "@/lib/datetime";

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
    const normalized = expiresAt.includes("T")
      ? expiresAt.replace("T", " ").slice(0, 19)
      : expiresAt;
    const withSeconds =
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(normalized)
        ? `${normalized}:00`
        : normalized;
    if (!isValidMysqlDatetime(withSeconds)) {
      return NextResponse.json({ error: "invalid_expiry" }, { status: 400 });
    }
    parsedExpiry = withSeconds;
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

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const id = typeof body.id === "number" ? body.id : Number(body.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  const deleted = await deleteInvitation(id);
  if (!deleted) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
