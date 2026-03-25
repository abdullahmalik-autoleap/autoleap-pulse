"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  TrendingUp,
  Plus,
  Users,
  Award,
  Clock,
} from "lucide-react";
import type { DateRange } from "@/types/dashboard";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { ErrorCard } from "@/components/dashboard/ErrorCard";
import { KeyboardShortcutsModal } from "@/components/dashboard/KeyboardShortcutsModal";
import { MRRTrendChart } from "./MRRTrendChart";
import { MRRWaterfallChart } from "./MRRWaterfallChart";
import { RevenuePlanBreakdown } from "./RevenuePlanBreakdown";
import { ChurnAnalysis } from "./ChurnAnalysis";
import { RevenueMetricsTable } from "./RevenueMetricsTable";

interface RevenueSummary {
  mrr: number;
  mrrDelta: number;
  arr: number;
  arrDelta: number;
  netNewMRR: number;
  netNewMRRDelta: number;
  arpu: number;
  arpuDelta: number;
  ltv: number;
  ltvDelta: number;
  paybackPeriod: number;
  paybackDelta: number;
}

interface MRRTrendPoint {
  month: string;
  mrr: number;
  arr: number;
}

interface WaterfallItem {
  label: string;
  value: number;
  type: string;
}

interface PlanData {
  plan: string;
  revenue: number;
  percentage: number;
  shopCount: number;
  arpu: number;
}

interface ChurnReason {
  reason: string;
  count: number;
  mrrImpact: number;
}

interface ChurnTrendPoint {
  month: string;
  churnRate: number;
}

interface ChurnAnalysisData {
  churnRate: number;
  churnRateDelta: number;
  churnMRR: number;
  avgTenureAtChurn: number;
  byReason: ChurnReason[];
  trend: ChurnTrendPoint[];
}

interface RecentChurnItem {
  shopName: string;
  plan: string;
  mrrImpact: number;
  reason: string;
  tenure: number;
  timeAgo: string;
}

interface PlanMixTrendPoint {
  month: string;
  starter: number;
  pro: number;
  enterprise: number;
}

interface ChurnProfile {
  avgTenureAtChurn: number;
  mostVulnerablePlan: string;
  highestRiskRegion: string;
  topChurnReason: string;
  topChurnReasonCount: number;
  mrrAtRisk: number;
}

interface MonthlyTableRow {
  month: string;
  mrr: number;
  momDelta: number;
  arr: number;
  newMRR: number;
  expansion: number;
  contraction: number;
  churn: number;
  netNew: number;
  arpu: number;
  shops: number;
}

export interface RevenueData {
  summary: RevenueSummary;
  mrrTrend: MRRTrendPoint[];
  mrrWaterfall: WaterfallItem[];
  byPlan: PlanData[];
  churnAnalysis: ChurnAnalysisData;
  recentChurn: RecentChurnItem[];
  planMixTrend: PlanMixTrendPoint[];
  churnProfile: ChurnProfile;
  monthlyTable: MonthlyTableRow[];
}

const REVENUE_RANGES: { key: DateRange; label: string; shortcut?: string }[] = [
  { key: "3m", label: "3M", shortcut: "3" },
  { key: "6m", label: "6M", shortcut: "6" },
  { key: "12m", label: "12M", shortcut: "1" },
];

const SHORTCUT_GROUPS = [
  {
    title: "General",
    shortcuts: [
      { key: "R", description: "Refresh data" },
      { key: "?", description: "Show keyboard shortcuts" },
    ],
  },
  {
    title: "Date Range",
    shortcuts: [
      { key: "3", description: "3 months" },
      { key: "6", description: "6 months" },
      { key: "1", description: "12 months" },
    ],
  },
];

export function RevenueClient() {
  const [dateRange, setDateRange] = useState<DateRange>("12m");
  const [data, setData] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const fetchData = useCallback(
    async (range: DateRange, isRangeChange = false) => {
      if (isRangeChange) setIsLoading(true);
      else setIsRefreshing(true);
      setError(null);

      try {
        const res = await fetch(`/api/revenue?range=${range}`);
        if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
        const json: RevenueData = await res.json();
        setData(json);
        setLastUpdated(new Date());
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(msg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchData(dateRange, true);
  }, [fetchData, dateRange]);

  const handleRangeChange = useCallback((range: DateRange) => {
    setDateRange(range);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchData(dateRange);
  }, [fetchData, dateRange]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      switch (e.key) {
        case "r":
        case "R":
          e.preventDefault();
          handleRefresh();
          break;
        case "3":
          e.preventDefault();
          handleRangeChange("3m");
          fetchData("3m", true);
          break;
        case "6":
          e.preventDefault();
          handleRangeChange("6m");
          fetchData("6m", true);
          break;
        case "1":
          e.preventDefault();
          handleRangeChange("12m");
          fetchData("12m", true);
          break;
        case "?":
          e.preventDefault();
          setShowShortcuts((v) => !v);
          break;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRefresh, handleRangeChange, fetchData]);

  const s = data?.summary;
  const netNewColor = (s?.netNewMRR ?? 0) >= 0 ? "success" : "danger";

  return (
    <>
      <PageHeader
        title="Revenue"
        icon={DollarSign}
        breadcrumbs={["Dashboard", "Revenue"]}
        ranges={REVENUE_RANGES}
        range={dateRange}
        onRangeChange={(range) => {
          handleRangeChange(range);
          fetchData(range, true);
        }}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
      />

      <main
        className="flex-1 overflow-y-auto relative"
        style={{
          padding: 24,
          backgroundImage: [
            "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(14,113,105,0.06) 0%, transparent 70%)",
          ].join(", "),
          backgroundSize: "40px 40px, 40px 40px, 100% 100%",
        }}
      >
        <div
          className="mx-auto max-w-[1600px] flex flex-col"
          style={{ gap: 16 }}
        >
          {error && (
            <div className="row-fade-in">
              <ErrorCard message={error} onRetry={handleRefresh} />
            </div>
          )}

          <div className="row-fade-in" style={{ animationDelay: "100ms" }}>
            <KPIGrid>
              <KPICard
                label="MRR"
                value={s ? +(s.mrr / 1000).toFixed(1) : 0}
                prefix="$"
                suffix="K"
                delta={s?.mrrDelta}
                deltaLabel="MoM"
                color="brand"
                icon={DollarSign}
                loading={isLoading}
              />
              <KPICard
                label="ARR"
                value={s ? +(s.arr / 1000).toFixed(1) : 0}
                prefix="$"
                suffix="K"
                delta={s?.arrDelta}
                deltaLabel="MoM"
                color="brand"
                icon={TrendingUp}
                loading={isLoading}
              />
              <KPICard
                label="Net New MRR"
                value={s ? +(s.netNewMRR / 1000).toFixed(1) : 0}
                prefix="$"
                suffix="K"
                delta={s?.netNewMRRDelta}
                deltaLabel="vs last month"
                color={netNewColor as "success" | "danger"}
                icon={Plus}
                loading={isLoading}
              />
              <KPICard
                label="ARPU"
                value={s?.arpu ?? 0}
                prefix="$"
                delta={s?.arpuDelta}
                deltaLabel="MoM"
                color="info"
                icon={Users}
                loading={isLoading}
              />
              <KPICard
                label="LTV"
                value={s?.ltv ?? 0}
                prefix="$"
                delta={s?.ltvDelta}
                deltaLabel="MoM"
                color="brand"
                icon={Award}
                loading={isLoading}
              />
              <KPICard
                label="Payback Period"
                value={s?.paybackPeriod ?? 0}
                suffix=" mo"
                delta={s?.paybackDelta}
                deltaLabel="MoM"
                color="warning"
                icon={Clock}
                loading={isLoading}
              />
            </KPIGrid>
          </div>

          <div className="row-fade-in" style={{ animationDelay: "200ms" }}>
            <MRRTrendChart
              data={data?.mrrTrend ?? []}
              currentMRR={s?.mrr ?? 0}
              mrrDelta={s?.mrrDelta ?? 0}
              isLoading={isLoading}
            />
          </div>

          <div
            className="grid row-fade-in"
            style={{
              gridTemplateColumns: "55fr 45fr",
              gap: 16,
              animationDelay: "300ms",
            }}
          >
            <MRRWaterfallChart
              data={data?.mrrWaterfall ?? []}
              currentMonth={
                data?.mrrTrend?.length
                  ? data.mrrTrend[data.mrrTrend.length - 1].month
                  : ""
              }
              isLoading={isLoading}
            />
            <RevenuePlanBreakdown
              plans={data?.byPlan ?? []}
              planMixTrend={data?.planMixTrend ?? []}
              isLoading={isLoading}
            />
          </div>

          <div className="row-fade-in" style={{ animationDelay: "400ms" }}>
            <ChurnAnalysis
              churnAnalysis={data?.churnAnalysis ?? null}
              churnProfile={data?.churnProfile ?? null}
              recentChurn={data?.recentChurn ?? []}
              isLoading={isLoading}
            />
          </div>

          <div className="row-fade-in" style={{ animationDelay: "500ms" }}>
            <RevenueMetricsTable
              data={data?.monthlyTable ?? []}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>

      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        groups={SHORTCUT_GROUPS}
      />
    </>
  );
}
