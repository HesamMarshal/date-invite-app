import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireVerified } from "@/lib/auth-guards";
import { createInvitation } from "@/lib/invite-queries";
import { parseCreateInviteBody } from "@/lib/invite-create";
import { checkCreateLimits } from "@/lib/plan-limits";

/**
 * Create invite (user-scoped).
 * - Verified Telegram user → `user_id` = session user; caps from `plan_types`
 * - Super-admin (`is_admin`) → skip quota
 */
export async function POST(request: NextRequest) {
  const verified = await requireVerified();
  const admin = await requireAdmin();

  if (!verified && !admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const user = verified ?? admin!;
  const userId = user.id;
  const skipLimits = !!user.is_admin;

  if (!skipLimits) {
    const limits = await checkCreateLimits(userId, user.plan_tier);
    if (!limits.ok) {
      return NextResponse.json({ error: limits.error }, { status: 403 });
    }
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
    userId
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://biyabaman.ir";
  const url = `${appUrl}/i/${token}`;

  return NextResponse.json({ token, url });
}
