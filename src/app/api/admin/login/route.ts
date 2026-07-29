import { NextRequest, NextResponse } from "next/server";
import { checkPassword, setAdminCookie } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (!password || !checkPassword(password)) {
    return NextResponse.json({ error: "wrong_password" }, { status: 401 });
  }

  await setAdminCookie();
  return NextResponse.json({ ok: true });
}
