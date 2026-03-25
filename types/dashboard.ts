export type DateRange = "7d" | "30d" | "90d" | "12m" | "3m" | "6m";

export interface KPIData {
  newSignups: number;
  newSignupsDelta: number;
  activeShops: number;
  activeShopsDelta: number;
  mrr: number;
  mrrDelta: number;
  churnRate: number;
  churnRateDelta: number;
  openTickets: number;
  openTicketsDelta: number;
  trialToPaid: number;
  trialToPaidDelta: number;
  npsScore: number;
  npsDelta: number;
  airTrials: number;
  airTrialsDelta: number;
}

export interface TrendDataPoint {
  date: string;
  signups: number;
  mrr: number;
  tickets: number;
  resolved: number;
}

export interface NPSBreakdown {
  promoters: number;
  passives: number;
  detractors: number;
}

export interface SupportCategory {
  category: string;
  count: number;
}

export interface FeatureRequest {
  title: string;
  votes: number;
  status: string;
}

export interface DashboardData {
  today: KPIData;
  trend: TrendDataPoint[];
  npsBreakdown: NPSBreakdown;
  topSupportCategories: SupportCategory[];
  topFeatureRequests: FeatureRequest[];
}
