import { NextRequest, NextResponse } from "next/server";
import { subDays, format, parse } from "date-fns";
import { auth } from "@/lib/auth";
import {
  getMetricForDate,
  getLatestMetric,
  getMetricRange,
  getTopSupportCategories,
  getTopFeatureRequests,
  calcDelta,
} from "@/lib/metrics";

const RANGE_MAP: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const range = searchParams.get("range") ?? "30d";
  const dateParam = searchParams.get("date");

  const rangeDays = RANGE_MAP[range] ?? 30;

  let targetDate = new Date();
  if (dateParam) {
    const parsed = parse(dateParam, "yyyy-MM-dd", new Date());
    if (!isNaN(parsed.getTime())) targetDate = parsed;
  }

  const [todayMetric, yesterdayMetric, lastMonthMetric, trendData, supportCategories, featureRequests] =
    await Promise.all([
      getMetricForDate(targetDate).then((m) => m ?? getLatestMetric()),
      getMetricForDate(subDays(targetDate, 1)),
      getMetricForDate(subDays(targetDate, 30)),
      getMetricRange(subDays(targetDate, rangeDays), targetDate),
      getTopSupportCategories(),
      getTopFeatureRequests(5),
    ]);

  const today = {
    newSignups: todayMetric?.newSignups ?? 0,
    newSignupsDelta: calcDelta(todayMetric?.newSignups, yesterdayMetric?.newSignups),
    activeShops: todayMetric?.activeShops ?? 0,
    activeShopsDelta: calcDelta(todayMetric?.activeShops, lastMonthMetric?.activeShops),
    mrr: todayMetric?.mrr ?? 0,
    mrrDelta: calcDelta(todayMetric?.mrr, lastMonthMetric?.mrr),
    churnRate: todayMetric?.churnRate ?? 0,
    churnRateDelta: calcDelta(todayMetric?.churnRate, lastMonthMetric?.churnRate),
    openTickets: todayMetric?.openTickets ?? 0,
    openTicketsDelta: calcDelta(todayMetric?.openTickets, yesterdayMetric?.openTickets),
    trialToPaid: todayMetric?.trialToPaid ?? 0,
    trialToPaidDelta: calcDelta(todayMetric?.trialToPaid, lastMonthMetric?.trialToPaid),
    npsScore: todayMetric?.npsScore ?? 0,
    npsDelta: calcDelta(todayMetric?.npsScore, lastMonthMetric?.npsScore),
    airTrials: todayMetric?.airTrials ?? 0,
    airTrialsDelta: calcDelta(todayMetric?.airTrials, yesterdayMetric?.airTrials),
  };

  const trend = trendData.map((m) => ({
    date: format(m.date, "MMM d"),
    signups: m.newSignups,
    mrr: m.mrr,
    tickets: m.openTickets,
    resolved: m.resolvedTickets,
  }));

  const npsBreakdown = {
    promoters: todayMetric?.promoters ?? 0,
    passives: todayMetric?.passives ?? 0,
    detractors: todayMetric?.detractors ?? 0,
  };

  return NextResponse.json({
    today,
    trend,
    npsBreakdown,
    topSupportCategories: supportCategories,
    topFeatureRequests: featureRequests,
  });
}
