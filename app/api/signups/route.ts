import { NextRequest, NextResponse } from "next/server";
import {
  subDays,
  format,
  startOfDay,
  startOfWeek,
  formatDistanceToNow,
} from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calcDelta } from "@/lib/metrics";

const RANGE_DAYS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "12m": 365,
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

  const [current, previous] = await Promise.all([
    prisma.signupEvent.findMany({
      where: { date: { gte: rangeStart } },
      orderBy: { date: "desc" },
    }),
    prisma.signupEvent.findMany({
      where: { date: { gte: prevStart, lt: rangeStart } },
    }),
  ]);

  if (current.length === 0) {
    return NextResponse.json({ error: "No data found" }, { status: 404 });
  }

  const converted = current.filter((e) => e.convertedAt !== null);
  const prevConverted = previous.filter((e) => e.convertedAt !== null);
  const conversionRate = current.length
    ? +((converted.length / current.length) * 100).toFixed(1)
    : 0;
  const prevConversionRate = previous.length
    ? +((prevConverted.length / previous.length) * 100).toFixed(1)
    : 0;

  const trialActive = current.filter(
    (e) =>
      e.convertedAt === null &&
      e.trialStart.getTime() > subDays(now, 14).getTime(),
  ).length;

  const avgPerDay = +(current.length / days).toFixed(1);
  const projectedMonthly = Math.round(avgPerDay * 30);

  const summary = {
    total: current.length,
    totalDelta: calcDelta(current.length, previous.length),
    converted: converted.length,
    conversionRate,
    conversionDelta: calcDelta(conversionRate, prevConversionRate),
    avgPerDay,
    trialActive,
    projectedMonthly,
  };

  // --- byDay ---
  const dayMap = new Map<string, { count: number; converted: number }>();
  for (const e of current) {
    const key = format(startOfDay(e.date), "yyyy-MM-dd");
    const entry = dayMap.get(key) ?? { count: 0, converted: 0 };
    entry.count++;
    if (e.convertedAt) entry.converted++;
    dayMap.set(key, entry);
  }
  const byDay = Array.from(dayMap.entries())
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // --- byPlan ---
  const byPlan = groupWithPercentage(current, (e) => e.plan);

  // --- byShopType ---
  const byShopType = groupWithPercentage(current, (e) => e.shopType).map(
    (r) => ({ type: r.key, count: r.count, percentage: r.percentage }),
  );

  // --- byRegion (with conversionRate and topState) ---
  const regionDetails = new Map<
    string,
    { count: number; converted: number; states: Map<string, number> }
  >();
  for (const e of current) {
    const entry = regionDetails.get(e.region) ?? {
      count: 0,
      converted: 0,
      states: new Map<string, number>(),
    };
    entry.count++;
    if (e.convertedAt) entry.converted++;
    entry.states.set(e.state, (entry.states.get(e.state) ?? 0) + 1);
    regionDetails.set(e.region, entry);
  }
  const totalSignups = current.length;
  const byRegion = Array.from(regionDetails.entries())
    .map(([region, v]) => {
      let topState = "";
      let topCount = 0;
      for (const [st, c] of v.states) {
        if (c > topCount) {
          topState = st;
          topCount = c;
        }
      }
      return {
        region,
        count: v.count,
        percentage: totalSignups
          ? +((v.count / totalSignups) * 100).toFixed(1)
          : 0,
        conversionRate: v.count
          ? +((v.converted / v.count) * 100).toFixed(1)
          : 0,
        topState,
      };
    })
    .sort((a, b) => b.count - a.count);

  // --- bySource ---
  const sourceMap = new Map<
    string,
    { count: number; conversions: number }
  >();
  for (const e of current) {
    const entry = sourceMap.get(e.source) ?? { count: 0, conversions: 0 };
    entry.count++;
    if (e.convertedAt) entry.conversions++;
    sourceMap.set(e.source, entry);
  }
  const bySource = Array.from(sourceMap.entries())
    .map(([source, v]) => ({
      source,
      count: v.count,
      conversions: v.conversions,
      conversionRate: v.count
        ? +((v.conversions / v.count) * 100).toFixed(1)
        : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // --- cohortConversion (weekly) ---
  const fourteenDaysAgo = subDays(now, 14);
  const weekMap = new Map<
    string,
    { signups: number; converted: number; stillInTrial: number; churned: number }
  >();
  for (const e of current) {
    const week = format(startOfWeek(e.date, { weekStartsOn: 1 }), "MMM d");
    const entry = weekMap.get(week) ?? {
      signups: 0,
      converted: 0,
      stillInTrial: 0,
      churned: 0,
    };
    entry.signups++;
    if (e.convertedAt) {
      entry.converted++;
    } else if (e.trialStart.getTime() > fourteenDaysAgo.getTime()) {
      entry.stillInTrial++;
    } else {
      entry.churned++;
    }
    weekMap.set(week, entry);
  }
  const cohortConversion = Array.from(weekMap.entries()).map(([week, v]) => ({
    week,
    signups: v.signups,
    converted: v.converted,
    convertedPct: v.signups
      ? +((v.converted / v.signups) * 100).toFixed(1)
      : 0,
    stillInTrial: v.stillInTrial,
    churned: v.churned,
  }));

  // --- recentSignups (last 10) ---
  const recentSignups = current.slice(0, 10).map((e) => ({
    shopName: e.shopName,
    plan: e.plan,
    shopType: e.shopType,
    city: e.city,
    state: e.state,
    source: e.source,
    timeAgo: formatDistanceToNow(e.date, { addSuffix: true }),
  }));

  const res = NextResponse.json({
    summary,
    byDay,
    byPlan: byPlan.map((r) => ({
      plan: r.key,
      count: r.count,
      percentage: r.percentage,
    })),
    byShopType,
    byRegion,
    bySource,
    cohortConversion,
    recentSignups,
  });
  res.headers.set("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  return res;
}

interface GroupRow {
  key: string;
  count: number;
  percentage: number;
}

function groupWithPercentage<T>(
  items: T[],
  keyFn: (item: T) => string,
): GroupRow[] {
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
