"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartCard } from "./ChartCard";
import { CustomTooltip } from "./CustomTooltip";
import { EmptyState } from "./EmptyState";
import { ChartSkeleton } from "./ChartSkeleton";
import { TrendingUp } from "lucide-react";
import { CHART_GRID, CHART_AXIS_TICK, CHART_AXIS, CHART_ANIMATION } from "@/lib/chartDefaults";

interface MRRDataPoint {
  date: string;
  mrr: number;
  target?: number;
}

function withTarget(data: { date: string; mrr: number }[]): MRRDataPoint[] {
  if (data.length === 0) return [];
  const targetValue = Math.round(data[0].mrr * 1.15);
  return data.map((d) => ({ ...d, target: targetValue }));
}

interface MRRChartProps {
  data?: MRRDataPoint[];
  isLoading?: boolean;
}

export function MRRChart({ data, isLoading }: MRRChartProps) {
  if (isLoading) return <ChartSkeleton />;

  if (!data || data.length === 0) {
    return (
      <ChartCard title="Monthly Recurring Revenue">
        <EmptyState icon={TrendingUp} message="No MRR data for this period" />
      </ChartCard>
    );
  }

  const chartData = data[0]?.target !== undefined ? data : withTarget(data);
  const first = chartData[0]?.mrr ?? 0;
  const last = chartData[chartData.length - 1]?.mrr ?? 0;
  const momGrowth = first > 0 ? (((last - first) / first) * 100).toFixed(1) : "0.0";
  const isPositive = last >= first;

  return (
    <ChartCard
      title="Monthly Recurring Revenue"
      headerRight={
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1"
          style={{
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "var(--font-data)",
            background: isPositive ? "var(--success-dim)" : "var(--danger-dim)",
            color: isPositive ? "var(--success)" : "var(--danger)",
          }}
        >
          {isPositive ? "+" : ""}
          {momGrowth}% MoM
        </span>
      }
    >
      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid {...CHART_GRID} />
            <XAxis
              dataKey="date"
              tick={CHART_AXIS_TICK}
              {...CHART_AXIS}
            />
            <YAxis
              tick={CHART_AXIS_TICK}
              {...CHART_AXIS}
              width={40}
              tickFormatter={(v: number) => `$${v}K`}
            />
            <Tooltip
              content={
                <CustomTooltip
                  colorMap={{ mrr: "#0E7169", target: "#3D5166" }}
                />
              }
              cursor={{ stroke: "rgba(255,255,255,0.06)" }}
            />
            <Line
              type="monotone"
              dataKey="mrr"
              name="MRR"
              stroke="#0E7169"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 5,
                fill: "#0E7169",
                stroke: "#060D1A",
                strokeWidth: 2,
              }}
              {...CHART_ANIMATION}
            />
            <Line
              type="monotone"
              dataKey="target"
              name="Target"
              stroke="var(--text-muted)"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              dot={false}
              activeDot={false}
              {...CHART_ANIMATION}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
