"use client";

import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import { LazyAreaChart as AreaChart } from "@/components/charts/lazy";
import { ChartCard } from "./ChartCard";
import { CustomTooltip } from "./CustomTooltip";
import { EmptyState } from "./EmptyState";
import { ChartSkeleton } from "./ChartSkeleton";
import { BarChart3 } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { CHART_GRID, CHART_AXIS_TICK, CHART_AXIS, CHART_ANIMATION } from "@/lib/chartDefaults";

interface SignupDataPoint {
  date: string;
  signups: number;
}

interface SignupChartProps {
  data?: SignupDataPoint[];
  isLoading?: boolean;
}

export function SignupChart({ data, isLoading }: SignupChartProps) {
  if (isLoading) return <ChartSkeleton height={240} />;

  if (!data || data.length === 0) {
    return (
      <ChartCard title="New Signups">
        <EmptyState icon={BarChart3} message="No signup data for this period" />
      </ChartCard>
    );
  }

  const todayTotal = data[data.length - 1]?.signups ?? 0;
  const peak = data.reduce(
    (max, d, i) => (d.signups > max.value ? { value: d.signups, index: i, date: d.date } : max),
    { value: 0, index: 0, date: "" }
  );

  return (
    <ChartCard
      title="New Signups"
      headerRight={
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1"
          style={{
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "var(--font-data)",
            background: "var(--brand-dim)",
            color: "var(--brand)",
          }}
        >
          {formatNumber(todayTotal)} today
        </span>
      }
    >
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-brand-grad-start)" />
                <stop offset="100%" stopColor="var(--chart-brand-grad-end)" />
              </linearGradient>
            </defs>
            <CartesianGrid {...CHART_GRID} />
            <XAxis
              dataKey="date"
              tick={CHART_AXIS_TICK}
              {...CHART_AXIS}
            />
            <YAxis
              tick={CHART_AXIS_TICK}
              {...CHART_AXIS}
              width={35}
            />
            <Tooltip
              content={<CustomTooltip colorMap={{ signups: "var(--brand)" }} />}
              cursor={{ stroke: "var(--chart-cursor-stroke)" }}
            />
            <Area
              type="monotone"
              dataKey="signups"
              name="Signups"
              stroke="var(--brand)"
              strokeWidth={2}
              fill="url(#signupGradient)"
              activeDot={{
                r: 5,
                fill: "var(--brand)",
                stroke: "var(--chart-dot-stroke)",
                strokeWidth: 2,
              }}
              {...CHART_ANIMATION}
            />
            <ReferenceDot
              x={peak.date}
              y={peak.value}
              r={3}
              fill="var(--brand)"
              stroke="var(--chart-dot-stroke)"
              strokeWidth={2}
              label={{
                value: `${peak.value}`,
                position: "top",
                fill: "var(--text-secondary)",
                fontSize: 10,
                fontFamily: "var(--font-data)",
                offset: 8,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
