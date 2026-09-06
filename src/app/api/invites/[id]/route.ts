import { NextRequest, NextResponse } from "next/server";
import { requireVerified } from "@/lib/auth-guards";
import {
  getInvitationOwnedByUser,
  setInvitationActiveForUser,
} from "@/lib/invite-queries";
import {
  countActiveInvitesForUser,
  FREE_MAX_ACTIVE_INVITES,
} from "@/lib/plan-limits";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await requireVerified();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id: idParam } = await context.params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (typeof body.is_active !== "boolean") {
    return NextResponse.json({ error: "is_active_required" }, { status: 400 });
  }
  const isActive = body.is_active;

  const invite = await getInvitationOwnedByUser(id, user.id);
  if (!invite) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Reactivating counts toward free active cap (monthly create is not checked).
  if (isActive && !invite.is_active && user.plan_tier === "free") {
    const active = await countActiveInvitesForUser(user.id);
    if (active >= FREE_MAX_ACTIVE_INVITES) {
      return NextResponse.json({ error: "limit_active" }, { status: 403 });
    }
  }

  const ok = await setInvitationActiveForUser(id, user.id, isActive);
  if (!ok) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, id, is_active: isActive });
}
