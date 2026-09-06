import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth-guards";
import { updateUserPlanTier } from "@/lib/user-queries";
import { getPlanLimits } from "@/lib/plan-limits";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, ctx: Ctx) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id: raw } = await ctx.params;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const planTier =
    typeof body.plan_tier === "string" ? body.plan_tier.trim() : "";
  if (!planTier) {
    return NextResponse.json({ error: "plan_tier_required" }, { status: 400 });
  }

  const exists = await getPlanLimits(planTier);
  if (!exists) {
    return NextResponse.json({ error: "invalid_plan" }, { status: 400 });
  }

  const ok = await updateUserPlanTier(id, planTier);
  if (!ok) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, id, plan_tier: planTier });
}
