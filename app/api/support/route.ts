import { NextRequest, NextResponse } from "next/server";
import {
  subDays,
  format,
  differenceInHours,
} from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calcDelta } from "@/lib/metrics";

const RANGE_DAYS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

const SLA_TARGETS: Record<string, { label: string; hrs: number }> = {
  urgent: { label: "1hr", hrs: 1 },
  high: { label: "4hr", hrs: 4 },
  normal: { label: "8hr", hrs: 8 },
  low: { label: "24hr", hrs: 24 },
};

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const range = request.nextUrl.searchParams.get("range") ?? "30d";
  const days = RANGE_DAYS[range] ?? 30;
  const now = new Date();
  const rangeStart = subDays(now, days);
  const prevStart = subDays(rangeStart, days);

  const [metrics, prevMetrics, tickets, prevTickets, openTicketsList] =
    await Promise.all([
      prisma.dailySupportMetric.findMany({
        where: { date: { gte: rangeStart } },
        orderBy: { date: "asc" },
      }),
      prisma.dailySupportMetric.findMany({
        where: { date: { gte: prevStart, lt: rangeStart } },
        orderBy: { date: "asc" },
      }),
      prisma.supportTicket.findMany({
        where: { createdAt: { gte: rangeStart } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.supportTicket.findMany({
        where: { createdAt: { gte: prevStart, lt: rangeStart } },
      }),
      prisma.supportTicket.findMany({
        where: { status: { in: ["open", "in_progress", "waiting"] } },
        orderBy: { createdAt: "asc" },
      }),
    ]);

  if (metrics.length === 0 && tickets.length === 0) {
    return NextResponse.json({ error: "No data found" }, { status: 404 });
  }

  // --- summary ---
  const avg = (arr: number[]) =>
    arr.length ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 0;

  const latestMetric = metrics[metrics.length - 1];
  const currentOpenTickets = latestMetric?.openTickets ?? openTicketsList.length;
  const prevLatestMetric = prevMetrics[prevMetrics.length - 1];

  const avgResponseMin = avg(metrics.map((m) => m.avgFirstResponseMin));
  const prevAvgResponseMin = avg(
    prevMetrics.map((m) => m.avgFirstResponseMin),
  );
  const avgResolutionHrs = avg(metrics.map((m) => m.avgResolutionHrs));
  const prevAvgResolutionHrs = avg(
    prevMetrics.map((m) => m.avgResolutionHrs),
  );
  const csatScore = avg(metrics.map((m) => m.csatScore));
  const prevCsatScore = avg(prevMetrics.map((m) => m.csatScore));
  const slaBreaches = metrics.reduce((s, m) => s + m.slaBreaches, 0);
  const prevSlaBreaches = prevMetrics.reduce((s, m) => s + m.slaBreaches, 0);

  const resolvedThisPeriod = tickets.filter(
    (t) => t.status === "resolved" || t.status === "closed",
  ).length;
  const stillOpen = tickets.filter(
    (t) => t.status !== "resolved" && t.status !== "closed",
  ).length;
  const resolutionRate =
    resolvedThisPeriod + stillOpen > 0
      ? +((resolvedThisPeriod / (resolvedThisPeriod + stillOpen)) * 100).toFixed(
          1,
        )
      : 0;

  const prevResolvedCount = prevTickets.filter(
    (t) => t.status === "resolved" || t.status === "closed",
  ).length;
  const prevStillOpen = prevTickets.filter(
    (t) => t.status !== "resolved" && t.status !== "closed",
  ).length;
  const prevResolutionRate =
    prevResolvedCount + prevStillOpen > 0
      ? +((prevResolvedCount / (prevResolvedCount + prevStillOpen)) * 100).toFixed(1)
      : 0;

  const summary = {
    openTickets: currentOpenTickets,
    openDelta: calcDelta(currentOpenTickets, prevLatestMetric?.openTickets),
    avgResponseMin: +avgResponseMin,
    avgResponseDelta: calcDelta(avgResponseMin, prevAvgResponseMin),
    avgResolutionHrs: +avgResolutionHrs,
    avgResolutionDelta: calcDelta(avgResolutionHrs, prevAvgResolutionHrs),
    csatScore: +csatScore,
    csatDelta: calcDelta(csatScore, prevCsatScore),
    slaBreaches,
    slaDelta: calcDelta(slaBreaches, prevSlaBreaches),
    resolvedThisPeriod,
    resolutionRate,
    resolutionRateDelta: calcDelta(resolutionRate, prevResolutionRate),
  };

  // --- ticketTrend ---
  const ticketTrend = metrics.map((m) => ({
    date: format(m.date, "MMM d"),
    opened: m.newTickets,
    resolved: m.resolvedTickets,
    backlog: m.openTickets,
  }));

  // --- byCategory ---
  const prevCatMap = new Map<string, number>();
  for (const t of prevTickets) {
    prevCatMap.set(t.category, (prevCatMap.get(t.category) ?? 0) + 1);
  }

  const byCategory = groupCount(tickets, (t) => t.category).map((r) => {
    const catTickets = tickets.filter((t) => t.category === r.key);
    const resolved = catTickets.filter(
      (t) => t.resolvedAt && t.firstResponseAt,
    );
    const avgHrs =
      resolved.length > 0
        ? +(
            resolved.reduce(
              (sum, t) =>
                sum + differenceInHours(t.resolvedAt!, t.createdAt),
              0,
            ) / resolved.length
          ).toFixed(1)
        : 0;
    const withCsat = catTickets.filter((t) => t.csat !== null);
    const csatAvg =
      withCsat.length > 0
        ? +(withCsat.reduce((sum, t) => sum + (t.csat ?? 0), 0) / withCsat.length).toFixed(1)
        : 0;
    const prevCount = prevCatMap.get(r.key) ?? 0;
    return {
      category: r.key,
      count: r.count,
      percentage: r.percentage,
      avgResolutionHrs: avgHrs,
      csatAvg,
      prevCount,
    };
  });

  // --- byPriority ---
  const byPriority = groupCount(tickets, (t) => t.priority).map((r) => ({
    priority: r.key,
    count: r.count,
    percentage: r.percentage,
  }));

  // --- byChannel ---
  const byChannel = groupCount(tickets, (t) => t.channel).map((r) => ({
    channel: r.key,
    count: r.count,
    percentage: r.percentage,
  }));

  // --- responseTimeTrend ---
  const responseTimeTrend = metrics.map((m) => ({
    date: format(m.date, "MMM d"),
    avgResponseMin: m.avgFirstResponseMin,
    avgResolutionHrs: m.avgResolutionHrs,
  }));

  // --- csatTrend ---
  const csatTrend = metrics.map((m) => ({
    date: format(m.date, "MMM d"),
    score: m.csatScore,
  }));

  // --- csatDistribution (1-5 star) ---
  const csatDistribution = [1, 2, 3, 4, 5].map((rating) => ({
    rating,
    count: tickets.filter((t) => t.csat === rating).length,
  }));

  // --- slaPerformance ---
  const RESOLUTION_SLA: Record<string, number> = {
    urgent: 4,
    high: 8,
    normal: 24,
    low: 48,
  };

  const totalTicketsInRange = tickets.length;
  const breachCount = slaBreaches;
  const breachRate =
    totalTicketsInRange > 0
      ? +((breachCount / totalTicketsInRange) * 100).toFixed(1)
      : 0;

  const slaByPriority = Object.entries(SLA_TARGETS).map(
    ([priority, target]) => {
      const prioTickets = tickets.filter((t) => t.priority === priority);
      const responseBreaches = prioTickets.filter((t) => {
        if (!t.firstResponseAt) return false;
        return differenceInHours(t.firstResponseAt, t.createdAt) > target.hrs;
      }).length;
      const resolutionTarget = RESOLUTION_SLA[priority];
      const resolutionBreaches = prioTickets.filter((t) => {
        if (!t.resolvedAt) return false;
        return differenceInHours(t.resolvedAt, t.createdAt) > resolutionTarget;
      }).length;
      const responseSlaMetPct =
        prioTickets.length > 0
          ? +((1 - responseBreaches / prioTickets.length) * 100).toFixed(1)
          : 100;
      const resolutionSlaMetPct =
        prioTickets.length > 0
          ? +((1 - resolutionBreaches / prioTickets.length) * 100).toFixed(1)
          : 100;
      return {
        priority,
        slaTarget: target.label,
        resolutionTarget: `${resolutionTarget}hr`,
        responseSlaMetPct,
        resolutionSlaMetPct,
        breachCount: responseBreaches + resolutionBreaches,
        totalTickets: prioTickets.length,
      };
    },
  );

  const totalSlaChecks = slaByPriority.reduce((s, p) => s + p.totalTickets * 2, 0);
  const totalSlaBreaches = slaByPriority.reduce((s, p) => s + p.breachCount, 0);
  const overallSlaScore =
    totalSlaChecks > 0
      ? +((1 - totalSlaBreaches / totalSlaChecks) * 100).toFixed(1)
      : 100;
  const grade =
    overallSlaScore >= 95 ? "A" : overallSlaScore >= 90 ? "B"
    : overallSlaScore >= 80 ? "C" : overallSlaScore >= 70 ? "D" : "F";

  const slaPerformance = {
    breachCount,
    breachRate,
    overallSlaScore,
    grade,
    byPriority: slaByPriority,
  };

  // --- openTickets list ---
  const openTicketsData = openTicketsList.map((t) => ({
    ticketNumber: t.ticketNumber,
    shopName: t.shopName,
    title: t.title,
    category: t.category,
    priority: t.priority,
    channel: t.channel,
    ageHrs: differenceInHours(now, t.createdAt),
    assignee: t.assignee,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
    firstResponseAt: t.firstResponseAt?.toISOString() ?? null,
  }));

  const res = NextResponse.json({
    summary,
    ticketTrend,
    byCategory,
    byPriority,
    byChannel,
    responseTimeTrend,
    csatTrend,
    csatDistribution,
    slaPerformance,
    openTickets: openTicketsData,
  });
  res.headers.set("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  return res;
}

function groupCount<T>(
  items: T[],
  keyFn: (item: T) => string,
): { key: string; count: number; percentage: number }[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const k = keyFn(item);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  const total = items.length;
  return Array.from(map.entries())
    .map(([key, count]) => ({
      key,
      count,
      percentage: total ? +((count / total) * 100).toFixed(1) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}
