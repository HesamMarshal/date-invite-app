import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  createInviteOption,
  listInviteOptions,
} from "@/lib/option-queries";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const options = await listInviteOptions(false);
  return NextResponse.json({ options });
}

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

  const emoji = typeof body.emoji === "string" ? body.emoji.trim() : "";
  const label = typeof body.label === "string" ? body.label.trim() : "";
  const sortOrder =
    body.sortOrder === undefined || body.sortOrder === null
      ? undefined
      : Number(body.sortOrder);

  if (!emoji || emoji.length > 16) {
    return NextResponse.json({ error: "emoji_required" }, { status: 400 });
  }
  if (!label || label.length > 50) {
    return NextResponse.json({ error: "label_required" }, { status: 400 });
  }
  if (sortOrder !== undefined && (!Number.isInteger(sortOrder) || sortOrder < 0)) {
    return NextResponse.json({ error: "invalid_sort" }, { status: 400 });
  }

  try {
    const id = await createInviteOption({ emoji, label, sortOrder });
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: "duplicate_or_failed" }, { status: 409 });
  }
}
