export const dynamic = "force-dynamic";

import { subDays, format } from "date-fns";
import {
  getMetricForDate,
  getLatestMetric,
  getMetricRange,
  getTopSupportCategories,
  getTopFeatureRequests,
  calcDelta,
} from "@/lib/metrics";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import type { DashboardData } from "@/types/dashboard";

export default async function OverviewPage() {
  const today = new Date();

  const [todayMetric, yesterdayMetric, lastMonthMetric, trendData, supportCategories, featureRequests] =
    await Promise.all([
      getMetricForDate(today).then((m) => m ?? getLatestMetric()),
      getMetricForDate(subDays(today, 1)),
      getMetricForDate(subDays(today, 30)),
      getMetricRange(subDays(today, 30), today),
      getTopSupportCategories(),
      getTopFeatureRequests(5),
    ]);

  const data: DashboardData = {
    today: {
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
    },
    trend: trendData.map((m) => ({
      date: format(m.date, "MMM d"),
      signups: m.newSignups,
      mrr: m.mrr,
      tickets: m.openTickets,
      resolved: m.resolvedTickets,
    })),
    npsBreakdown: {
      promoters: todayMetric?.promoters ?? 0,
      passives: todayMetric?.passives ?? 0,
      detractors: todayMetric?.detractors ?? 0,
    },
    topSupportCategories: supportCategories,
    topFeatureRequests: featureRequests,
  };

  return <DashboardClient initialData={data} />;
}
