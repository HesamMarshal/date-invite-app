import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  removeInviteOption,
  updateInviteOption,
} from "@/lib/option-queries";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, ctx: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id: rawId } = await ctx.params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const emoji = typeof body.emoji === "string" ? body.emoji.trim() : "";
  const label = typeof body.label === "string" ? body.label.trim() : "";
  const sortOrder = Number(body.sortOrder);
  const isActive = Boolean(body.isActive);

  if (!emoji || emoji.length > 16) {
    return NextResponse.json({ error: "emoji_required" }, { status: 400 });
  }
  if (!label || label.length > 50) {
    return NextResponse.json({ error: "label_required" }, { status: 400 });
  }
  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    return NextResponse.json({ error: "invalid_sort" }, { status: 400 });
  }

  try {
    const ok = await updateInviteOption(id, {
      emoji,
      label,
      sortOrder,
      isActive,
    });
    if (!ok) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "duplicate_or_failed" }, { status: 409 });
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id: rawId } = await ctx.params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  const result = await removeInviteOption(id);
  if (result === "not_found") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ result });
}
