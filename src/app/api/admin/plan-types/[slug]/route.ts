import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth-guards";
import {
  isValidPlanSlug,
  parsePlanCap,
  updatePlanTypeCaps,
} from "@/lib/plan-limits";

type Ctx = { params: Promise<{ slug: string }> };

export async function PATCH(request: NextRequest, ctx: Ctx) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { slug: raw } = await ctx.params;
  const slug = decodeURIComponent(raw).trim().toLowerCase();
  if (!isValidPlanSlug(slug)) {
    return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const maxActive = parsePlanCap(body.max_active);
  const maxMonthly = parsePlanCap(body.max_monthly_creates);
  if (maxActive == null || maxMonthly == null) {
    return NextResponse.json({ error: "invalid_caps" }, { status: 400 });
  }

  const ok = await updatePlanTypeCaps(slug, maxActive, maxMonthly);
  if (!ok) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    plan: {
      slug,
      max_active: maxActive,
      max_monthly_creates: maxMonthly,
    },
  });
}
