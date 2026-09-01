import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createInvitation, deleteInvitation } from "@/lib/invite-queries";
import { normalizeInviteText } from "@/lib/invite-defaults";
import {
  isValidMysqlDate,
  isValidMysqlDatetime,
  toTimeHm,
  validateInviteWindows,
} from "@/lib/datetime";
import {
  MIN_INVITE_OPTIONS,
  MAX_INVITE_OPTIONS,
} from "@/lib/food-options";
import {
  countActiveOptionsByIds,
  listInviteOptions,
} from "@/lib/option-queries";

function parseOptionalDate(value: unknown): string | null | "invalid" {
  if (value == null || value === "") return null;
  if (typeof value !== "string") return "invalid";
  const d = value.trim();
  return isValidMysqlDate(d) ? d : "invalid";
}

function parseOptionalTime(value: unknown): string | null | "invalid" {
  if (value == null || value === "") return null;
  if (typeof value !== "string") return "invalid";
  const t = toTimeHm(value);
  if (!t) return "invalid";
  return `${t}:00`;
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

  const {
    recipientName,
    inviteText,
    expiresAt,
    optionIds,
    dateFrom,
    dateTo,
    timeFrom,
    timeTo,
  } = body;

  if (!recipientName || typeof recipientName !== "string") {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }

  if (recipientName.trim().length > 100) {
    return NextResponse.json({ error: "name_too_long" }, { status: 400 });
  }

  if (typeof inviteText === "string" && inviteText.trim().length > 200) {
    return NextResponse.json({ error: "invite_text_too_long" }, { status: 400 });
  }

  let resolvedOptionIds: number[];
  if (Array.isArray(optionIds) && optionIds.length > 0) {
    resolvedOptionIds = [
      ...new Set(
        optionIds
          .map((id) => (typeof id === "number" ? id : Number(id)))
          .filter((id) => Number.isInteger(id) && id > 0)
      ),
    ];
  } else {
    const active = await listInviteOptions(true);
    resolvedOptionIds = active.slice(0, MAX_INVITE_OPTIONS).map((o) => o.id);
  }

  if (
    resolvedOptionIds.length < MIN_INVITE_OPTIONS ||
    resolvedOptionIds.length > MAX_INVITE_OPTIONS
  ) {
    return NextResponse.json({ error: "invalid_option_count" }, { status: 400 });
  }

  const matched = await countActiveOptionsByIds(resolvedOptionIds);
  if (matched !== resolvedOptionIds.length) {
    return NextResponse.json({ error: "invalid_options" }, { status: 400 });
  }

  const parsedDateFrom = parseOptionalDate(dateFrom);
  const parsedDateTo = parseOptionalDate(dateTo);
  const parsedTimeFrom = parseOptionalTime(timeFrom);
  const parsedTimeTo = parseOptionalTime(timeTo);

  if (
    parsedDateFrom === "invalid" ||
    parsedDateTo === "invalid" ||
    parsedTimeFrom === "invalid" ||
    parsedTimeTo === "invalid"
  ) {
    return NextResponse.json({ error: "invalid_window" }, { status: 400 });
  }

  const windows = {
    dateFrom: parsedDateFrom,
    dateTo: parsedDateTo,
    timeFrom: parsedTimeFrom,
    timeTo: parsedTimeTo,
  };

  const windowError = validateInviteWindows({
    dateFrom: windows.dateFrom,
    dateTo: windows.dateTo,
    timeFrom: windows.timeFrom ? toTimeHm(windows.timeFrom) : null,
    timeTo: windows.timeTo ? toTimeHm(windows.timeTo) : null,
  });
  if (windowError) {
    return NextResponse.json({ error: windowError }, { status: 400 });
  }

  let parsedExpiry: string | null = null;
  if (expiresAt && typeof expiresAt === "string") {
    const normalized = expiresAt.includes("T")
      ? expiresAt.replace("T", " ").slice(0, 19)
      : expiresAt;
    const withSeconds =
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(normalized)
        ? `${normalized}:00`
        : normalized;
    if (!isValidMysqlDatetime(withSeconds)) {
      return NextResponse.json({ error: "invalid_expiry" }, { status: 400 });
    }
    parsedExpiry = withSeconds;
  }

  const token = await createInvitation(
    recipientName.trim(),
    normalizeInviteText(inviteText),
    parsedExpiry,
    resolvedOptionIds,
    windows
  );
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://biyabaman.ir";
  const url = `${appUrl}/i/${token}`;

  return NextResponse.json({ token, url });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const id = typeof body.id === "number" ? body.id : Number(body.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  const deleted = await deleteInvitation(id);
  if (!deleted) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
