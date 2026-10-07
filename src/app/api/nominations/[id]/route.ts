import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";

function getToken(req: NextRequest): string | undefined {
  return req.cookies.get(COOKIE_NAME)?.value;
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifySessionToken(getToken(req)))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await params;
  await prisma.nomination.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
