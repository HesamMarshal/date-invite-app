import { NextRequest, NextResponse } from "next/server";
import { requireVerified } from "@/lib/auth-guards";
import { createInvitation } from "@/lib/invite-queries";
import { parseCreateInviteBody } from "@/lib/invite-create";
import { checkFreeCreateLimits } from "@/lib/plan-limits";

export async function POST(request: NextRequest) {
  const user = await requireVerified();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const limits = await checkFreeCreateLimits(user.id, user.plan_tier);
  if (!limits.ok) {
    return NextResponse.json({ error: limits.error }, { status: 403 });
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
    user.id
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://biyabaman.ir";
  const url = `${appUrl}/i/${token}`;

  return NextResponse.json({ token, url });
}
