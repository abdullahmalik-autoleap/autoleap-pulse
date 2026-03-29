"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Inbox,
  Clock,
  CheckCheck,
  Star,
  AlertTriangle,
  BarChart2,
  Headphones,
} from "lucide-react";
import type { DateRange } from "@/types/dashboard";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { ErrorCard } from "@/components/dashboard/ErrorCard";
import { TicketVolumeTrendChart } from "./TicketVolumeTrendChart";
import { ResponseTimeTrendChart } from "./ResponseTimeTrendChart";
import { CSATChart } from "./CSATChart";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { SLAPerformanceCard } from "./SLAPerformanceCard";
import { OpenTicketsTable } from "./OpenTicketsTable";
import { LazySection } from "@/components/lazy-section";

interface SupportSummary {
  openTickets: number;
  openDelta: number;
  avgResponseMin: number;
  avgResponseDelta: number;
  avgResolutionHrs: number;
  avgResolutionDelta: number;
  csatScore: number;
  csatDelta: number;
  slaBreaches: number;
  slaDelta: number;
  resolvedThisPeriod: number;
  resolutionRate: number;
  resolutionRateDelta: number;
}

interface TicketTrendPoint {
  date: string;
  opened: number;
  resolved: number;
  backlog: number;
}

interface CategoryData {
  category: string;
  count: number;
  percentage: number;
  avgResolutionHrs: number;
  csatAvg: number;
  prevCount: number;
}

interface ResponseTimeTrendPoint {
  date: string;
  avgResponseMin: number;
  avgResolutionHrs: number;
}

interface CSATTrendPoint {
  date: string;
  score: number;
}

interface CSATDistributionPoint {
  rating: number;
  count: number;
}

interface SLAPriorityData {
  priority: string;
  slaTarget: string;
  resolutionTarget: string;
  responseSlaMetPct: number;
  resolutionSlaMetPct: number;
  breachCount: number;
  totalTickets: number;
}

interface SLAPerformanceData {
  breachCount: number;
  breachRate: number;
  overallSlaScore: number;
  grade: string;
  byPriority: SLAPriorityData[];
}

interface OpenTicketData {
  ticketNumber: string;
  shopName: string;
  title: string;
  category: string;
  priority: string;
  channel: string;
  ageHrs: number;
  assignee: string | null;
  status: string;
  createdAt: string;
  firstResponseAt: string | null;
}

export interface SupportData {
  summary: SupportSummary;
  ticketTrend: TicketTrendPoint[];
  byCategory: CategoryData[];
  responseTimeTrend: ResponseTimeTrendPoint[];
  csatTrend: CSATTrendPoint[];
  csatDistribution: CSATDistributionPoint[];
  slaPerformance: SLAPerformanceData;
  openTickets: OpenTicketData[];
}

type AutoColor = "brand" | "warning" | "danger";

function getAutoColor(value: number, dangerAbove: number, warningAbove: number): AutoColor {
  if (value > dangerAbove) return "danger";
  if (value > warningAbove) return "warning";
  return "brand";
}

const SUPPORT_RANGES: { key: DateRange; label: string; shortcut?: string }[] = [
  { key: "7d", label: "7D", shortcut: "7" },
  { key: "30d", label: "30D", shortcut: "3" },
  { key: "90d", label: "90D", shortcut: "9" },
];

export function SupportClient() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [data, setData] = useState<SupportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>();
  const [error, setError] = useState<string | null>(null);
  const fetchData = useCallback(
    async (range: DateRange, isRangeChange = false) => {
      if (isRangeChange) setIsLoading(true);
      else setIsRefreshing(true);
      setError(null);

      try {
        const res = await fetch(`/api/support?range=${range}`);
        if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
        const json: SupportData = await res.json();
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
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRefresh, handleRangeChange, fetchData]);

  const s = data?.summary;

  const openTicketColor = getAutoColor(s?.openTickets ?? 0, 40, 20);
  const avgResponseColor = getAutoColor(s?.avgResponseMin ?? 0, 120, 60);
  const avgResolutionColor = getAutoColor(s?.avgResolutionHrs ?? 0, 48, 24);
  const slaBreachColor = getAutoColor(s?.slaBreaches ?? 0, 5, 1);

  return (
    <>
      <PageHeader
        title="Support"
        icon={Headphones}
        breadcrumbs={["Dashboard", "Support"]}
        ranges={SUPPORT_RANGES}
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
            "linear-gradient(var(--page-grid-line) 1px, transparent 1px)",
            "linear-gradient(90deg, var(--page-grid-line) 1px, transparent 1px)",
            "radial-gradient(ellipse 60% 40% at 50% 0%, var(--page-grid-glow) 0%, transparent 70%)",
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
                label="Open Tickets"
                value={s?.openTickets ?? 0}
                delta={s?.openDelta}
                deltaLabel="vs prior period"
                color={openTicketColor}
                icon={Inbox}
                loading={isLoading}
              />
              <KPICard
                label="Avg Response"
                value={s?.avgResponseMin ?? 0}
                suffix=" min"
                delta={s?.avgResponseDelta}
                deltaLabel="vs prior period"
                color={avgResponseColor}
                icon={Clock}
                loading={isLoading}
              />
              <KPICard
                label="Avg Resolution"
                value={s?.avgResolutionHrs ?? 0}
                suffix=" hrs"
                delta={s?.avgResolutionDelta}
                deltaLabel="vs prior period"
                color={avgResolutionColor}
                icon={CheckCheck}
                loading={isLoading}
              />
              <KPICard
                label="CSAT Score"
                value={s?.csatScore ?? 0}
                suffix="/5"
                delta={s?.csatDelta}
                deltaLabel="vs prior period"
                color="brand"
                icon={Star}
                loading={isLoading}
              />
              <KPICard
                label="SLA Breaches"
                value={s?.slaBreaches ?? 0}
                delta={s?.slaDelta}
                deltaLabel="vs prior period"
                color={slaBreachColor}
                icon={AlertTriangle}
                loading={isLoading}
              />
              <KPICard
                label="Resolution Rate"
                value={s?.resolutionRate ?? 0}
                suffix="%"
                delta={s?.resolutionRateDelta}
                deltaLabel="vs prior period"
                color="brand"
                icon={BarChart2}
                loading={isLoading}
              />
            </KPIGrid>
          </div>

          <LazySection height={360}>
            <TicketVolumeTrendChart
              data={data?.ticketTrend ?? []}
              isLoading={isLoading}
            />
          </LazySection>

          <LazySection height={320}>
            <div
              className="grid"
              style={{
                gridTemplateColumns: "55fr 45fr",
                gap: 16,
              }}
            >
              <ResponseTimeTrendChart
                data={data?.responseTimeTrend ?? []}
                slaPerformance={data?.slaPerformance ?? null}
                isLoading={isLoading}
              />
              <CSATChart
                score={s?.csatScore ?? 0}
                trend={data?.csatTrend ?? []}
                distribution={data?.csatDistribution ?? []}
                isLoading={isLoading}
              />
            </div>
          </LazySection>

          <LazySection height={300}>
            <CategoryBreakdown
              data={data?.byCategory ?? []}
              isLoading={isLoading}
            />
          </LazySection>

          <LazySection height={400}>
            <div
              className="grid"
              style={{
                gridTemplateColumns: "60fr 40fr",
                gap: 16,
              }}
            >
              <OpenTicketsTable
                data={data?.openTickets ?? []}
                isLoading={isLoading}
              />
              <SLAPerformanceCard
                data={data?.slaPerformance ?? null}
                isLoading={isLoading}
              />
            </div>
          </LazySection>
        </div>
      </main>
    </>
  );
}
