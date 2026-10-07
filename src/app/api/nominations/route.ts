import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateNomination, type NominationInput } from "@/lib/validation";
import { NOMINATION_CYCLE } from "@/lib/constants";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";

// Simple in-memory rate limiter per IP to deter accidental/bulk spam submissions.
const submissionLog = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (submissionLog.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  submissionLog.set(ip, timestamps);
  return timestamps.length > MAX_PER_WINDOW;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many submissions from this network. Please try again in a minute." },
      { status: 429 }
    );
  }

  let body: NominationInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { errors, data } = validateNomination(body);
  if (errors.length > 0) {
    return NextResponse.json({ error: "Validation failed.", fieldErrors: errors }, { status: 400 });
  }

  const existing = await prisma.nomination.findFirst({
    where: {
      schoolName: { equals: data.schoolName },
      rollNo: { equals: data.rollNo },
      cycle: NOMINATION_CYCLE,
    },
  });

  if (existing) {
    return NextResponse.json(
      {
        error:
          "A nomination with this School Name and Roll No. already exists for this cycle. If you need to correct it, please contact the camp coordinator.",
        duplicate: true,
      },
      { status: 409 }
    );
  }

  const nomination = await prisma.nomination.create({
    data: { ...data, cycle: NOMINATION_CYCLE },
  });

  return NextResponse.json({ id: nomination.id }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state") ?? undefined;
  const q = searchParams.get("q") ?? undefined;

  const nominations = await prisma.nomination.findMany({
    where: {
      ...(state ? { schoolState: state } : {}),
      ...(q
        ? {
            OR: [
              { studentName: { contains: q } },
              { schoolName: { contains: q } },
              { rollNo: { contains: q } },
              { schoolDistrict: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ nominations });
}
