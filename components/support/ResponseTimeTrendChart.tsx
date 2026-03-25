"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Clock } from "lucide-react";
import { CHART_GRID, CHART_AXIS_TICK, CHART_AXIS, CHART_ANIMATION, CHART_TOOLTIP_BG } from "@/lib/chartDefaults";

interface ResponseTimeTrendPoint {
  date: string;
  avgResponseMin: number;
  avgResolutionHrs: number;
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

interface ResponseTimeTrendChartProps {
  data: ResponseTimeTrendPoint[];
  slaPerformance: SLAPerformanceData | null;
  isLoading?: boolean;
}

function getBarColor(pct: number): string {
  if (pct >= 90) return "var(--brand)";
  if (pct >= 75) return "var(--warning)";
  return "var(--danger)";
}

export function ResponseTimeTrendChart({ data, slaPerformance, isLoading }: ResponseTimeTrendChartProps) {
  if (isLoading) return <ChartSkeleton height={300} />;

  if (!data || data.length === 0) {
    return (
      <ChartCard title="Response & Resolution Time">
        <EmptyState icon={Clock} message="No response time data for this period" />
      </ChartCard>
    );
  }

  const peakDay = useMemo(() => {
    if (data.length === 0) return null;
    let maxIdx = 0;
    for (let i = 1; i < data.length; i++) {
      if (data[i].avgResponseMin > data[maxIdx].avgResponseMin) maxIdx = i;
    }
    return { index: maxIdx, date: data[maxIdx].date, value: data[maxIdx].avgResponseMin };
  }, [data]);

  const responseSlaMetPct = useMemo(() => {
    if (!slaPerformance) return 0;
    const total = slaPerformance.byPriority.reduce((s, p) => s + p.totalTickets, 0);
    if (total === 0) return 100;
    const weightedSum = slaPerformance.byPriority.reduce(
      (s, p) => s + p.responseSlaMetPct * p.totalTickets,
      0,
    );
    return +(weightedSum / total).toFixed(1);
  }, [slaPerformance]);

  const resolutionSlaMetPct = useMemo(() => {
    if (!slaPerformance) return 0;
    const total = slaPerformance.byPriority.reduce((s, p) => s + p.totalTickets, 0);
    if (total === 0) return 100;
    const weightedSum = slaPerformance.byPriority.reduce(
      (s, p) => s + p.resolutionSlaMetPct * p.totalTickets,
      0,
    );
    return +(weightedSum / total).toFixed(1);
  }, [slaPerformance]);

  return (
    <ChartCard
      title="Response & Resolution Time"
      subtitle="Average first response and resolution times"
    >
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="responseAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0E7169" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#0E7169" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid {...CHART_GRID} />
            <XAxis
              dataKey="date"
              tick={{ ...CHART_AXIS_TICK, fontSize: 10 }}
              {...CHART_AXIS}
            />
            <YAxis
              yAxisId="left"
              tick={{ ...CHART_AXIS_TICK, fontSize: 10 }}
              {...CHART_AXIS}
              width={35}
              tickFormatter={(v: number) => `${v}m`}
              label={{
                value: "Response (min)",
                angle: -90,
                position: "insideLeft",
                style: { fill: "var(--text-muted)", fontSize: 9, fontFamily: "var(--font-data)" },
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ ...CHART_AXIS_TICK, fontSize: 10 }}
              {...CHART_AXIS}
              width={35}
              tickFormatter={(v: number) => `${v}h`}
              label={{
                value: "Resolution (hrs)",
                angle: 90,
                position: "insideRight",
                style: { fill: "var(--text-muted)", fontSize: 9, fontFamily: "var(--font-data)" },
              }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const response = payload.find((p) => p.dataKey === "avgResponseMin")?.value as number ?? 0;
                const resolution = payload.find((p) => p.dataKey === "avgResolutionHrs")?.value as number ?? 0;
                return (
                  <div
                    style={{
                      background: CHART_TOOLTIP_BG,
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      fontFamily: "var(--font-data)",
                      fontSize: 12,
                    }}
                  >
                    <p style={{ color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
                    <div className="flex items-center gap-2" style={{ marginTop: 3 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#0E7169" }} />
                      <span style={{ color: "var(--text-secondary)" }}>First Response</span>
                      <span style={{ color: response > 60 ? "var(--danger)" : "var(--text-primary)", fontWeight: 600, marginLeft: "auto" }}>
                        {response} min
                      </span>
                    </div>
                    <div className="flex items-center gap-2" style={{ marginTop: 3 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F59E0B" }} />
                      <span style={{ color: "var(--text-secondary)" }}>Resolution</span>
                      <span style={{ color: resolution > 24 ? "var(--danger)" : "var(--text-primary)", fontWeight: 600, marginLeft: "auto" }}>
                        {resolution.toFixed(1)} hrs
                      </span>
                    </div>
                  </div>
                );
              }}
              cursor={{ fill: "rgba(255,255,255,0.02)" }}
            />
            <ReferenceLine
              yAxisId="left"
              y={60}
              stroke="var(--text-muted)"
              strokeDasharray="4 2"
              label={{
                value: "SLA: 60min",
                position: "right",
                fill: "var(--text-muted)",
                fontSize: 9,
                fontFamily: "var(--font-data)",
              }}
            />
            <Area
              yAxisId="left"
              dataKey="avgResponseMin"
              name="First Response"
              stroke="#0E7169"
              strokeWidth={2}
              fill="url(#responseAreaGrad)"
              dot={false}
              {...CHART_ANIMATION}
              label={({ x, y, index }: { x?: string | number; y?: string | number; index?: number }) => {
                const nx = Number(x ?? 0);
                const ny = Number(y ?? 0);
                if (!peakDay || index !== peakDay.index) return <g />;
                return (
                  <g>
                    <rect
                      x={nx - 36}
                      y={ny - 24}
                      width={72}
                      height={18}
                      rx={4}
                      fill="var(--surface-2)"
                      stroke="var(--danger)"
                      strokeWidth={1}
                    />
                    <text
                      x={nx}
                      y={ny - 12}
                      textAnchor="middle"
                      fill="var(--danger)"
                      fontSize={9}
                      fontFamily="var(--font-data)"
                    >
                      Longest wait
                    </text>
                  </g>
                );
              }}
            />
            <Line
              yAxisId="right"
              dataKey="avgResolutionHrs"
              name="Resolution"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={false}
              {...CHART_ANIMATION}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div
        className="flex items-center gap-6"
        style={{
          marginTop: 16,
          padding: "10px 16px",
          background: "var(--surface-2)",
          borderRadius: 8,
          fontFamily: "var(--font-data)",
          fontSize: 12,
        }}
      >
        <div className="flex-1">
          <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
            <span style={{ color: "var(--text-secondary)" }}>First Response SLA</span>
            <span style={{ color: getBarColor(responseSlaMetPct), fontWeight: 600 }}>
              {responseSlaMetPct}% met
            </span>
          </div>
          <div style={{ height: 6, background: "var(--surface-3)", borderRadius: 3, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${Math.min(responseSlaMetPct, 100)}%`,
                background: getBarColor(responseSlaMetPct),
                borderRadius: 3,
                transition: "width 800ms ease",
              }}
            />
          </div>
        </div>
        <div style={{ width: 1, height: 28, background: "var(--pulse-border)" }} />
        <div className="flex-1">
          <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
            <span style={{ color: "var(--text-secondary)" }}>Resolution SLA</span>
            <span style={{ color: getBarColor(resolutionSlaMetPct), fontWeight: 600 }}>
              {resolutionSlaMetPct}% met
            </span>
          </div>
          <div style={{ height: 6, background: "var(--surface-3)", borderRadius: 3, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${Math.min(resolutionSlaMetPct, 100)}%`,
                background: getBarColor(resolutionSlaMetPct),
                borderRadius: 3,
                transition: "width 800ms ease",
              }}
            />
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
