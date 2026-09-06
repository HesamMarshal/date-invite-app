import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth-guards";
import { createInvitation } from "@/lib/invite-queries";
import { parseCreateInviteBody } from "@/lib/invite-create";

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = await parseCreateInviteBody(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error },
      { status: parsed.status }
    );
  }

  const token = await createInvitation(
    parsed.recipientName,
    parsed.inviteText,
    parsed.expiresAt,
    parsed.optionIds,
    parsed.windows,
    null
  );
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://biyabaman.ir";
  const url = `${appUrl}/i/${token}`;

  return NextResponse.json({ token, url });
}
