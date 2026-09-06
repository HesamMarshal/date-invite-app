import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth-guards";
import {
  createPlanType,
  isValidPlanSlug,
  listPlanTypes,
} from "@/lib/plan-limits";

function parsePositiveInt(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(n) || n < 1) return null;
  return n;
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const plans = await listPlanTypes();
  return NextResponse.json({ plans });
}

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

  const slug =
    typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const maxActive = parsePositiveInt(body.max_active);
  const maxMonthly = parsePositiveInt(body.max_monthly_creates);

  if (!isValidPlanSlug(slug)) {
    return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
  }
  if (maxActive == null || maxMonthly == null) {
    return NextResponse.json({ error: "invalid_caps" }, { status: 400 });
  }

  try {
    await createPlanType(slug, maxActive, maxMonthly);
    return NextResponse.json({
      ok: true,
      plan: {
        slug,
        max_active: maxActive,
        max_monthly_creates: maxMonthly,
      },
    });
  } catch {
    return NextResponse.json({ error: "duplicate_or_failed" }, { status: 409 });
  }
}
