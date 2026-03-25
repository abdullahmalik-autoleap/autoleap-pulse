"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserPlus,
  CheckCircle,
  TrendingUp,
  Clock,
  BarChart2,
  Target,
} from "lucide-react";
import type { DateRange } from "@/types/dashboard";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { ErrorCard } from "@/components/dashboard/ErrorCard";
import { KeyboardShortcutsModal } from "@/components/dashboard/KeyboardShortcutsModal";
import { SignupTrendChart } from "./SignupTrendChart";
import { SignupBreakdowns } from "./SignupBreakdowns";
import { RegionalBreakdown } from "./RegionalBreakdown";
import { CohortTable } from "./CohortTable";

interface SignupSummary {
  total: number;
  totalDelta: number;
  converted: number;
  conversionRate: number;
  conversionDelta: number;
  avgPerDay: number;
  trialActive: number;
  projectedMonthly: number;
}

interface ByDay {
  date: string;
  count: number;
  converted: number;
}

interface ByPlan {
  plan: string;
  count: number;
  percentage: number;
}

interface ByShopType {
  type: string;
  count: number;
  percentage: number;
}

interface BySource {
  source: string;
  count: number;
  conversions: number;
  conversionRate: number;
}

interface CohortConversion {
  week: string;
  signups: number;
  converted: number;
  convertedPct: number;
  stillInTrial: number;
  churned: number;
}

interface RecentSignup {
  shopName: string;
  plan: string;
  shopType: string;
  city: string;
  state: string;
  source: string;
  timeAgo: string;
}

export interface SignupsData {
  summary: SignupSummary;
  byDay: ByDay[];
  byPlan: ByPlan[];
  byShopType: ByShopType[];
  byRegion: { region: string; count: number; percentage: number; conversionRate: number; topState: string }[];
  bySource: BySource[];
  cohortConversion: CohortConversion[];
  recentSignups: RecentSignup[];
}

const SIGNUPS_RANGES: { key: DateRange; label: string; shortcut?: string }[] = [
  { key: "7d", label: "7D", shortcut: "7" },
  { key: "30d", label: "30D", shortcut: "3" },
  { key: "90d", label: "90D", shortcut: "9" },
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
      { key: "7", description: "7 days" },
      { key: "3", description: "30 days" },
      { key: "9", description: "90 days" },
      { key: "1", description: "12 months" },
    ],
  },
];

export function SignupsClient() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [data, setData] = useState<SignupsData | null>(null);
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
        const res = await fetch(`/api/signups?range=${range}`);
        if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
        const json: SignupsData = await res.json();
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
        case "7":
          e.preventDefault();
          handleRangeChange("7d");
          fetchData("7d", true);
          break;
        case "3":
          e.preventDefault();
          handleRangeChange("30d");
          fetchData("30d", true);
          break;
        case "9":
          e.preventDefault();
          handleRangeChange("90d");
          fetchData("90d", true);
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

  return (
    <>
      <PageHeader
        title="Signups"
        icon={UserPlus}
        breadcrumbs={["Dashboard", "Signups"]}
        ranges={SIGNUPS_RANGES}
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
                label="Total Signups"
                value={s?.total ?? 0}
                delta={s?.totalDelta}
                deltaLabel="vs prior period"
                color="brand"
                icon={UserPlus}
                loading={isLoading}
              />
              <KPICard
                label="Converted to Paid"
                value={s?.converted ?? 0}
                delta={s?.totalDelta}
                deltaLabel="vs prior period"
                color="success"
                icon={CheckCircle}
                loading={isLoading}
              />
              <KPICard
                label="Conversion Rate"
                value={s?.conversionRate ?? 0}
                suffix="%"
                delta={s?.conversionDelta}
                deltaLabel="vs prior period"
                color="brand"
                icon={TrendingUp}
                loading={isLoading}
              />
              <KPICard
                label="Active Trials"
                value={s?.trialActive ?? 0}
                color="info"
                icon={Clock}
                loading={isLoading}
              />
              <KPICard
                label="Avg / Day"
                value={s?.avgPerDay ?? 0}
                delta={s?.totalDelta}
                deltaLabel="vs prior period"
                color="success"
                icon={BarChart2}
                loading={isLoading}
              />
              <KPICard
                label="Projected Monthly"
                value={s?.projectedMonthly ?? 0}
                color="warning"
                icon={Target}
                loading={isLoading}
              />
            </KPIGrid>
            <div className="flex justify-end mt-1 pr-1">
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-data)",
                  color: "var(--text-muted)",
                  letterSpacing: "0.02em",
                }}
              >
                at current pace
              </span>
            </div>
          </div>

          <div className="row-fade-in" style={{ animationDelay: "200ms" }}>
            <SignupTrendChart
              data={data?.byDay ?? []}
              total={s?.total ?? 0}
              isLoading={isLoading}
            />
          </div>

          <div className="row-fade-in" style={{ animationDelay: "300ms" }}>
            <SignupBreakdowns
              bySource={data?.bySource ?? []}
              byPlan={data?.byPlan ?? []}
              byShopType={data?.byShopType ?? []}
              isLoading={isLoading}
            />
          </div>

          <div className="row-fade-in" style={{ animationDelay: "400ms" }}>
            <RegionalBreakdown
              data={data?.byRegion ?? []}
              isLoading={isLoading}
            />
          </div>

          <div className="row-fade-in" style={{ animationDelay: "500ms" }}>
            <CohortTable
              data={data?.cohortConversion ?? []}
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
