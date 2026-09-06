import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireVerified } from "@/lib/auth-guards";
import { createInvitation } from "@/lib/invite-queries";
import { parseCreateInviteBody } from "@/lib/invite-create";
import { checkFreeCreateLimits } from "@/lib/plan-limits";

/**
 * Create invite (user-scoped).
 * - Verified Telegram user → `user_id` = session user; free limits unless Pro / is_admin
 * - Super-admin via Telegram (`is_admin`) → same, no free limits
 * - Password-only admin (no user session) → 401 `telegram_required` (no orphan invites)
 */
export async function POST(request: NextRequest) {
  const verified = await requireVerified();
  const admin = await requireAdmin();

  let userId: number;
  let skipFreeLimits = false;

  if (verified) {
    userId = verified.id;
    skipFreeLimits =
      verified.plan_tier === "pro" || verified.is_admin || admin !== null;
  } else if (admin?.via === "session") {
    userId = admin.user.id;
    skipFreeLimits = true;
  } else if (admin?.via === "password") {
    return NextResponse.json(
      { error: "telegram_required" },
      { status: 401 }
    );
  } else {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!skipFreeLimits) {
    const limits = await checkFreeCreateLimits(userId, "free");
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
