import { NextRequest, NextResponse } from "next/server";
import { subMonths, format, formatDistanceToNow } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calcDelta } from "@/lib/metrics";

const RANGE_MONTHS: Record<string, number> = {
  "3m": 3,
  "6m": 6,
  "12m": 12,
};

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const range = request.nextUrl.searchParams.get("range") ?? "12m";
  const months = RANGE_MONTHS[range] ?? 12;
  const now = new Date();
  const rangeStart = subMonths(now, months);

  const snapshots = await prisma.revenueSnapshot.findMany({
    where: { date: { gte: rangeStart } },
    orderBy: { date: "asc" },
  });

  if (snapshots.length === 0) {
    return NextResponse.json({ error: "No data found" }, { status: 404 });
  }

  const latest = snapshots[snapshots.length - 1];
  const prev = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null;

  // --- summary ---
  const summary = {
    mrr: latest.mrr,
    mrrDelta: calcDelta(latest.mrr, prev?.mrr),
    arr: latest.arr,
    arrDelta: calcDelta(latest.arr, prev?.arr),
    netNewMRR: latest.netNewMRR,
    netNewMRRDelta: calcDelta(latest.netNewMRR, prev?.netNewMRR),
    arpu: latest.avgRevenuePerShop,
    arpuDelta: calcDelta(latest.avgRevenuePerShop, prev?.avgRevenuePerShop),
    ltv: latest.ltv,
    ltvDelta: calcDelta(latest.ltv, prev?.ltv),
    paybackPeriod: latest.paybackPeriod,
    paybackDelta: calcDelta(latest.paybackPeriod, prev?.paybackPeriod),
  };

  // --- mrrTrend ---
  const mrrTrend = snapshots.map((s) => ({
    month: format(s.date, "MMM yyyy"),
    mrr: s.mrr,
    arr: s.arr,
  }));

  // --- mrrWaterfall (current month breakdown) ---
  const startingMRR = prev ? prev.mrr : latest.mrr - latest.netNewMRR;
  const mrrWaterfall = [
    { label: "Starting MRR", value: +startingMRR.toFixed(2), type: "base" },
    { label: "New MRR", value: +latest.newMRR.toFixed(2), type: "positive" },
    {
      label: "Expansion",
      value: +latest.expansionMRR.toFixed(2),
      type: "positive",
    },
    {
      label: "Contraction",
      value: +(-latest.contractionMRR).toFixed(2),
      type: "negative",
    },
    { label: "Churn", value: +(-latest.churnMRR).toFixed(2), type: "negative" },
    { label: "Ending MRR", value: +latest.mrr.toFixed(2), type: "total" },
  ];

  // --- byPlan ---
  const totalRevenue =
    latest.starterRevenue + latest.proRevenue + latest.enterpriseRevenue;
  const planRows = [
    { plan: "starter", revenue: latest.starterRevenue },
    { plan: "pro", revenue: latest.proRevenue },
    { plan: "enterprise", revenue: latest.enterpriseRevenue },
  ];

  const byPlan = planRows.map((p) => {
    const percentage = totalRevenue
      ? +((p.revenue / totalRevenue) * 100).toFixed(1)
      : 0;
    const shopCount =
      latest.avgRevenuePerShop > 0
        ? Math.round(p.revenue / latest.avgRevenuePerShop)
        : 0;
    return {
      plan: p.plan,
      revenue: +p.revenue.toFixed(2),
      percentage,
      shopCount,
      arpu:
        shopCount > 0 ? +(p.revenue / shopCount).toFixed(2) : 0,
    };
  });

  // --- churnAnalysis ---
  const churnRangeStart = subMonths(now, months);
  const [churnEvents, latestDailyMetric] = await Promise.all([
    prisma.churnEvent.findMany({
      where: { date: { gte: churnRangeStart } },
      orderBy: { date: "desc" },
    }),
    prisma.dailyMetric.findFirst({ orderBy: { date: "desc" } }),
  ]);

  const reasonMap = new Map<string, { count: number; mrrImpact: number }>();
  let totalTenure = 0;
  for (const ce of churnEvents) {
    totalTenure += ce.tenure;
    const entry = reasonMap.get(ce.reason) ?? { count: 0, mrrImpact: 0 };
    entry.count++;
    entry.mrrImpact += ce.mrrImpact;
    reasonMap.set(ce.reason, entry);
  }

  const byReason = Array.from(reasonMap.entries())
    .map(([reason, v]) => ({
      reason,
      count: v.count,
      mrrImpact: +v.mrrImpact.toFixed(2),
    }))
    .sort((a, b) => b.count - a.count);

  const currentChurnRate = latestDailyMetric?.churnRate ?? 0;
  const prevDailyMetric = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null;
  const prevChurnRate = prevDailyMetric
    ? (prevDailyMetric.churnMRR / prevDailyMetric.mrr) * 100
    : 0;

  const churnTrend = snapshots.map((s) => ({
    month: format(s.date, "MMM yyyy"),
    churnRate: s.mrr > 0 ? +((s.churnMRR / s.mrr) * 100).toFixed(2) : 0,
  }));

  const churnAnalysis = {
    churnRate: +currentChurnRate.toFixed(2),
    churnRateDelta: calcDelta(currentChurnRate, prevChurnRate || null),
    churnMRR: +latest.churnMRR.toFixed(2),
    avgTenureAtChurn:
      churnEvents.length > 0
        ? +(totalTenure / churnEvents.length).toFixed(1)
        : 0,
    byReason,
    trend: churnTrend,
  };

  // --- recentChurn (last 5) ---
  const recentChurn = churnEvents.slice(0, 5).map((ce) => ({
    shopName: ce.shopName,
    plan: ce.plan,
    mrrImpact: +ce.mrrImpact.toFixed(2),
    reason: ce.reason,
    tenure: ce.tenure,
    timeAgo: formatDistanceToNow(ce.date, { addSuffix: true }),
  }));

  // --- planMixTrend ---
  const planMixTrend = snapshots.map((s) => ({
    month: format(s.date, "MMM yyyy"),
    starter: +s.starterRevenue.toFixed(2),
    pro: +s.proRevenue.toFixed(2),
    enterprise: +s.enterpriseRevenue.toFixed(2),
  }));

  // --- churnProfile ---
  const planChurnMap = new Map<string, number>();
  const regionChurnMap = new Map<string, number>();
  for (const ce of churnEvents) {
    planChurnMap.set(ce.plan, (planChurnMap.get(ce.plan) ?? 0) + 1);
    regionChurnMap.set(ce.region, (regionChurnMap.get(ce.region) ?? 0) + 1);
  }
  const mostVulnerablePlan = [...planChurnMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A";
  const highestRiskRegion = [...regionChurnMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A";
  const mrrAtRisk = +(latest.churnMRR * 0.8).toFixed(2);

  const churnProfile = {
    avgTenureAtChurn: churnAnalysis.avgTenureAtChurn,
    mostVulnerablePlan,
    highestRiskRegion,
    topChurnReason: byReason[0]?.reason ?? "N/A",
    topChurnReasonCount: byReason[0]?.count ?? 0,
    mrrAtRisk,
  };

  // --- monthlyTable ---
  const monthlyTable = snapshots.map((s, i) => {
    const prevSnap = i > 0 ? snapshots[i - 1] : null;
    const momDelta = prevSnap ? calcDelta(s.mrr, prevSnap.mrr) : 0;
    const shops = s.avgRevenuePerShop > 0 ? Math.round(s.mrr / s.avgRevenuePerShop) : 0;
    return {
      month: format(s.date, "MMM yyyy"),
      mrr: +s.mrr.toFixed(2),
      momDelta,
      arr: +s.arr.toFixed(2),
      newMRR: +s.newMRR.toFixed(2),
      expansion: +s.expansionMRR.toFixed(2),
      contraction: +s.contractionMRR.toFixed(2),
      churn: +s.churnMRR.toFixed(2),
      netNew: +s.netNewMRR.toFixed(2),
      arpu: +s.avgRevenuePerShop.toFixed(2),
      shops,
    };
  });

  return NextResponse.json({
    summary,
    mrrTrend,
    mrrWaterfall,
    byPlan,
    churnAnalysis,
    recentChurn,
    planMixTrend,
    churnProfile,
    monthlyTable,
  });
}
