import { NextRequest, NextResponse } from "next/server";
import { getInvitationByToken, upsertResponse } from "@/lib/invite-queries";
import { isValidFoodChoice } from "@/lib/food-options";
import { isValidMysqlDatetime } from "@/lib/datetime";

const RATE_LIMIT = new Map<string, number>();
const RATE_WINDOW = 60_000;
const RATE_MAX = 10;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const last = RATE_LIMIT.get(key) ?? 0;
  if (now - last < RATE_WINDOW / RATE_MAX) {
    return true;
  }
  RATE_LIMIT.set(key, now);
  return false;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { token, accepted, selectedDatetime, foodChoice } = body;

  if (!token || typeof token !== "string" || typeof accepted !== "boolean") {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  if (isRateLimited(`${ip}:${token}`)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const invite = await getInvitationByToken(token);
  if (!invite) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "expired" }, { status: 410 });
  }

  if (accepted) {
    if (
      !selectedDatetime ||
      typeof selectedDatetime !== "string" ||
      !foodChoice ||
      typeof foodChoice !== "string" ||
      !isValidFoodChoice(foodChoice)
    ) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }
    if (!isValidMysqlDatetime(selectedDatetime)) {
      return NextResponse.json({ error: "invalid_datetime" }, { status: 400 });
    }
  }

  await upsertResponse(
    invite.id,
    accepted,
    accepted ? (selectedDatetime as string) : null,
    accepted ? (foodChoice as string) : null
  );

  return NextResponse.json({ ok: true });
}
