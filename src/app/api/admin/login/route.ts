import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { COOKIE_NAME, MAX_AGE_SECONDS, createSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const expected = process.env.ADMIN_PASSWORD ?? "";

  const a = Buffer.from(String(password ?? ""));
  const b = Buffer.from(expected);
  const match = a.length === b.length && expected.length > 0 && crypto.timingSafeEqual(a, b);

  if (!match) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return res;
}
