import { NextRequest, NextResponse } from "next/server";
import { getInvitationByToken, upsertResponse } from "@/lib/invite-queries";
import { isValidFoodChoice } from "@/lib/food-options";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { token, accepted, selectedDatetime, foodChoice } = body;

  if (!token || typeof accepted !== "boolean") {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const invite = await getInvitationByToken(token);
  if (!invite) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "expired" }, { status: 410 });
  }

  if (accepted) {
    if (!selectedDatetime || !foodChoice || !isValidFoodChoice(foodChoice)) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }
  }

  await upsertResponse(
    invite.id,
    accepted,
    accepted ? selectedDatetime : null,
    accepted ? foodChoice : null
  );

  return NextResponse.json({ ok: true });
}
