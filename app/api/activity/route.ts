import { NextRequest, NextResponse } from "next/server";
import { formatDistanceToNow } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = Math.min(Math.max(parseInt(limitParam ?? "20", 10) || 20, 1), 50);

  const raw = await prisma.activityEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const events = raw.map((e) => ({
    id: e.id,
    type: e.type,
    message: e.message,
    severity: e.severity,
    timeAgo: formatDistanceToNow(e.createdAt, { addSuffix: true }),
    createdAt: e.createdAt.toISOString(),
  }));

  const res = NextResponse.json({ events });
  res.headers.set("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  return res;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, message, severity = "info", metadata } = body;

  if (!type || !message) {
    return NextResponse.json(
      { error: "type and message are required" },
      { status: 400 }
    );
  }

  const event = await prisma.activityEvent.create({
    data: {
      type,
      message,
      severity,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
