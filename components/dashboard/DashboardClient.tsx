"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  UserPlus,
  Store,
  DollarSign,
  TrendingDown,
  HeadphonesIcon,
  ThumbsUp,
  LayoutDashboard,
} from "lucide-react";

import type { DashboardData, DateRange } from "@/types/dashboard";
import { ToastContext, useToastState } from "@/lib/hooks/useToast";

import { PageHeader } from "./PageHeader";
import { KPICard } from "./KPICard";
import { KPIGrid } from "./KPIGrid";
import { SignupChart } from "./SignupChart";
import { MRRChart } from "./MRRChart";
import { TicketChart } from "./TicketChart";
import { NPSCard } from "./NPSCard";
import { AIBriefing } from "./AIBriefing";
import { ActivityFeed } from "./ActivityFeed";
import { FeatureRequestsPanel } from "./FeatureRequestsPanel";
import { SupportHealthPanel } from "./SupportHealthPanel";
import { ErrorCard } from "./ErrorCard";
import { Toaster } from "./Toaster";
import { LazySection } from "@/components/lazy-section";
const SUPPORT_COLORS: Record<string, string> = {
  Billing: "var(--danger)",
  Sync: "var(--warning)",
  Bug: "var(--info)",
  Feature: "var(--brand)",
  General: "var(--text-muted)",
};

const OVERVIEW_RANGES: { key: DateRange; label: string; shortcut?: string }[] = [
  { key: "7d", label: "7D", shortcut: "7" },
  { key: "30d", label: "30D", shortcut: "3" },
  { key: "90d", label: "90D", shortcut: "9" },
];

interface DashboardClientProps {
  initialData: DashboardData;
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [data, setData] = useState<DashboardData>(initialData);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toastState = useToastState();

  const fetchData = useCallback(
    async (range: DateRange, isRangeChange = false) => {
      if (isRangeChange) {
        setChartLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      try {
        const res = await fetch(`/api/metrics?range=${range}`);
        if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
        const json: DashboardData = await res.json();
        setData(json);
        setLastUpdated(new Date());

        if (!isRangeChange) {
          toastState.toast("↻ Data refreshed", "info");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(msg);
        toastState.toast(`Failed to load: ${msg}`, "error");
      } finally {
        setIsRefreshing(false);
        setChartLoading(false);
      }
    },
    [toastState]
  );

  const handleRangeChange = useCallback(
    (range: DateRange) => {
      setDateRange(range);
      fetchData(range, true);
    },
    [fetchData]
  );

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
          break;
        case "3":
          e.preventDefault();
          handleRangeChange("30d");
          break;
        case "9":
          e.preventDefault();
          handleRangeChange("90d");
          break;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRefresh, handleRangeChange]);

  useEffect(() => {
    const count = data.today.newSignups;
    document.title = count > 0
      ? `[${count}] Pulse · AutoLeap`
      : "Pulse · Overview · AutoLeap";
  }, [data.today.newSignups]);

  const signupData = useMemo(() => data.trend.map((t) => ({ date: t.date, signups: t.signups })), [data.trend]);
  const mrrData = useMemo(() => data.trend.map((t) => ({ date: t.date, mrr: t.mrr })), [data.trend]);
  const ticketData = useMemo(() => data.trend.map((t) => ({
    date: t.date,
    opened: t.tickets,
    resolved: t.resolved,
  })), [data.trend]);

  const supportData = useMemo(() => data.topSupportCategories.map((c) => ({
    name: c.category,
    value: c.count,
    color: SUPPORT_COLORS[c.category] ?? "var(--text-muted)",
  })), [data.topSupportCategories]);

  const signupSparkline = useMemo(() => signupData.map((s) => s.signups), [signupData]);
  const mrrSparkline = useMemo(() => mrrData.map((m) => m.mrr), [mrrData]);

  const metricsSnapshot: Record<string, unknown> = {
    newSignups: data.today.newSignups,
    activeShops: data.today.activeShops,
    mrr: data.today.mrr,
    churnRate: data.today.churnRate,
    openTickets: data.today.openTickets,
    npsScore: data.today.npsScore,
    trialToPaid: data.today.trialToPaid,
    airTrials: data.today.airTrials,
  };

  return (
    <ToastContext.Provider value={toastState}>
      <PageHeader
        title="Overview"
        icon={LayoutDashboard}
        breadcrumbs={["Dashboard", "Overview"]}
        ranges={OVERVIEW_RANGES}
        range={dateRange}
        onRangeChange={handleRangeChange}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
      />

      <main
        className="flex-1 overflow-y-auto relative"
        style={{
          padding: 24,
          backgroundImage: [
            "linear-gradient(var(--page-grid-line) 1px, transparent 1px)",
            "linear-gradient(90deg, var(--page-grid-line) 1px, transparent 1px)",
            "radial-gradient(ellipse 60% 40% at 50% 0%, var(--page-grid-glow) 0%, transparent 70%)",
          ].join(", "),
          backgroundSize: "40px 40px, 40px 40px, 100% 100%",
        }}
      >
        {error && (
          <div className="mb-4 row-fade-in">
            <ErrorCard message={error} onRetry={handleRefresh} />
          </div>
        )}

        <div className="mx-auto max-w-[1600px] flex flex-col" style={{ gap: 16 }}>
          <div className="row-fade-in" style={{ animationDelay: "100ms" }}>
            <KPIGrid>
              <KPICard
                label="New Signups"
                value={data.today.newSignups}
                delta={data.today.newSignupsDelta}
                deltaLabel="vs yesterday"
                color="brand"
                icon={UserPlus}
                sparklineData={signupSparkline}
              />
              <KPICard
                label="Active Shops"
                value={data.today.activeShops}
                delta={data.today.activeShopsDelta}
                deltaLabel="MoM"
                color="info"
                icon={Store}
              />
              <KPICard
                label="MRR"
                value={data.today.mrr}
                prefix="$"
                suffix="K"
                delta={data.today.mrrDelta}
                deltaLabel="MoM"
                color="success"
                icon={DollarSign}
                sparklineData={mrrSparkline}
              />
              <KPICard
                label="Churn Rate"
                value={data.today.churnRate}
                suffix="%"
                delta={data.today.churnRateDelta}
                deltaLabel="vs last month"
                color="warning"
                icon={TrendingDown}
              />
              <KPICard
                label="Open Tickets"
                value={data.today.openTickets}
                delta={data.today.openTicketsDelta}
                deltaLabel="vs yesterday"
                color="danger"
                icon={HeadphonesIcon}
              />
              <KPICard
                label="NPS Score"
                value={data.today.npsScore}
                delta={data.today.npsDelta}
                deltaLabel="vs last month"
                color="brand"
                icon={ThumbsUp}
              />
            </KPIGrid>
          </div>

          <LazySection height={320}>
            <div className="grid gap-4 grid-cols-1 xl:grid-cols-[65%_1fr]">
              <div style={{ minHeight: 280 }}>
                <SignupChart data={signupData} isLoading={chartLoading} />
              </div>
              <div style={{ minHeight: 280 }}>
                <AIBriefing metricsSnapshot={metricsSnapshot} />
              </div>
            </div>
          </LazySection>

          <LazySection height={300}>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
              <MRRChart data={mrrData} isLoading={chartLoading} />
              <TicketChart data={ticketData} isLoading={chartLoading} />
              <NPSCard
                score={data.today.npsScore}
                promoters={data.npsBreakdown.promoters}
                passives={data.npsBreakdown.passives}
                detractors={data.npsBreakdown.detractors}
                delta={data.today.npsDelta}
                isLoading={chartLoading}
              />
            </div>
          </LazySection>

          <LazySection height={340}>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-[55%_1fr]">
              <ActivityFeed />
              <div className="flex flex-col gap-4">
                <FeatureRequestsPanel data={data.topFeatureRequests} />
                <SupportHealthPanel data={supportData} />
              </div>
            </div>
          </LazySection>
        </div>
      </main>

      <Toaster />
    </ToastContext.Provider>
  );
}
