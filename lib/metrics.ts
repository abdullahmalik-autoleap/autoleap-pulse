import { prisma } from "./db";
import { startOfDay, endOfDay } from "date-fns";

export async function getMetricForDate(date: Date) {
  return prisma.dailyMetric.findFirst({
    where: {
      date: {
        gte: startOfDay(date),
        lt: endOfDay(date),
      },
    },
  });
}

export async function getLatestMetric() {
  return prisma.dailyMetric.findFirst({
    orderBy: { date: "desc" },
  });
}

export async function getMetricRange(from: Date, to: Date) {
  return prisma.dailyMetric.findMany({
    where: {
      date: {
        gte: startOfDay(from),
        lte: endOfDay(to),
      },
    },
    orderBy: { date: "asc" },
  });
}

export async function getTopSupportCategories() {
  const groups = await prisma.supportTicket.groupBy({
    by: ["category"],
    _count: { category: true },
    orderBy: { _count: { category: "desc" } },
  });

  return groups.map((g) => ({
    category: g.category,
    count: g._count.category,
  }));
}

export async function getTopFeatureRequests(limit = 5) {
  return prisma.featureRequest.findMany({
    orderBy: { votes: "desc" },
    take: limit,
    select: { title: true, votes: true, status: true },
  });
}

export function calcDelta(current: number | null | undefined, previous: number | null | undefined): number {
  if (!previous || !current) return 0;
  return +((current - previous) / Math.abs(previous) * 100).toFixed(1);
}

const EVENT_TEMPLATES: { type: string; message: string; severity: string }[] = [
  { type: "signup", message: "Ace Auto Repair signed up for a free trial", severity: "success" },
  { type: "signup", message: "Coastal Collision Center created an account", severity: "success" },
  { type: "signup", message: "Heritage Motors started a 14-day trial", severity: "success" },
  { type: "signup", message: "Northstar Auto Body joined AutoLeap", severity: "success" },
  { type: "signup", message: "BlueLine Garage signed up via partner referral", severity: "success" },
  { type: "churn", message: "Churn alert: Riverside Auto cancelled subscription", severity: "danger" },
  { type: "churn", message: "Churn risk: Sunset Collision hasn't logged in for 12 days", severity: "warning" },
  { type: "churn", message: "Churn alert: Capital Auto Works downgraded to free tier", severity: "warning" },
  { type: "air_trial", message: "AIR trial started: Peak Performance Auto activated AI diagnostics", severity: "info" },
  { type: "air_trial", message: "AIR trial converted: Greenfield Motors upgraded to AIR Pro", severity: "success" },
  { type: "air_trial", message: "AIR trial expiring: Harborview Auto has 2 days remaining", severity: "warning" },
  { type: "ticket", message: "Ticket escalated: DMS sync failure at Hillside Motors", severity: "danger" },
  { type: "ticket", message: "High-priority ticket: Payment processing error at Atlas Garage", severity: "danger" },
  { type: "ticket", message: "Ticket resolved: Inventory lookup fixed for Crosstown Auto", severity: "success" },
  { type: "nps", message: "NPS response received: Score 9 from Downtown Garage", severity: "success" },
  { type: "nps", message: "Detractor alert: Score 3 from Valley Collision — wants better reporting", severity: "warning" },
  { type: "nps", message: "Promoter feedback: Score 10 from Trident Auto — loves AI estimates", severity: "success" },
  { type: "feature_request", message: "Feature upvoted: Multi-location inventory sync (+1 vote)", severity: "info" },
  { type: "feature_request", message: "New feature request: Automated parts ordering from vendors", severity: "info" },
  { type: "feature_request", message: "Feature upvoted: Digital vehicle inspection with photos (+3 votes)", severity: "info" },
];

export async function generateRealtimeEvent() {
  const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];

  return prisma.activityEvent.create({
    data: {
      type: template.type,
      message: template.message,
      severity: template.severity,
    },
  });
}
