import { NextResponse } from "next/server";

/** Password admin login removed (plan 14-2). Use Telegram + is_admin. */
export async function POST() {
  return NextResponse.json(
    { error: "deprecated", message: "Use Telegram login with is_admin" },
    { status: 410 }
  );
}
