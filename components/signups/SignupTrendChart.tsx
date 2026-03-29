"use client";

import { useMemo } from "react";
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Brush,
  ResponsiveContainer,
} from "recharts";
import { LazyComposedChart as ComposedChart } from "@/components/charts/lazy";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { CustomTooltip } from "@/components/dashboard/CustomTooltip";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { BarChart3 } from "lucide-react";
import { CHART_GRID, CHART_AXIS_TICK, CHART_AXIS, CHART_BAR_RADIUS, CHART_ANIMATION } from "@/lib/chartDefaults";

interface DataPoint {
  date: string;
  count: number;
  converted: number;
}

interface SignupTrendChartProps {
  data: DataPoint[];
  total: number;
  isLoading?: boolean;
}

function computeRollingAvg(data: DataPoint[], window: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < window - 1) return null;
    let sum = 0;
    for (let j = i - window + 1; j <= i; j++) sum += data[j].count;
    return +(sum / window).toFixed(1);
  });
}

interface LabelProps {
  x?: string | number;
  y?: string | number;
  width?: string | number;
  index?: number;
}

export function SignupTrendChart({ data, total, isLoading }: SignupTrendChartProps) {
  if (isLoading) return <ChartSkeleton height={300} />;

  if (!data || data.length === 0) {
    return (
      <ChartCard title="Daily Signup Volume">
        <EmptyState icon={BarChart3} message="No signup data for this period" />
      </ChartCard>
    );
  }

  const chartData = useMemo(() => {
    const rolling = computeRollingAvg(data, 7);
    return data.map((d, i) => ({
      ...d,
      avg7d: rolling[i],
    }));
  }, [data]);

  const avg = useMemo(() => {
    if (data.length === 0) return 0;
    return +(data.reduce((s, d) => s + d.count, 0) / data.length).toFixed(1);
  }, [data]);

  const peak = useMemo(() => {
    if (data.length === 0) return null;
    let maxIdx = 0;
    for (let i = 1; i < data.length; i++) {
      if (data[i].count > data[maxIdx].count) maxIdx = i;
    }
    return { index: maxIdx, date: data[maxIdx].date, value: data[maxIdx].count };
  }, [data]);

  const todayCount = data.length > 0 ? data[data.length - 1].count : 0;
  const yesterdayCount = data.length > 1 ? data[data.length - 2].count : 0;
  const vsDelta = yesterdayCount > 0
    ? +(((todayCount - yesterdayCount) / yesterdayCount) * 100).toFixed(1)
    : 0;
  const isPositive = vsDelta >= 0;

  return (
    <ChartCard
      title="Daily Signup Volume"
      subtitle={`${total.toLocaleString()} total signups in period`}
      headerRight={
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: "var(--brand)",
                  opacity: 0.7,
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-data)",
                  color: "var(--text-secondary)",
                }}
              >
                Daily signups
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                style={{
                  width: 14,
                  height: 2,
                  background: "var(--text-muted)",
                  display: "inline-block",
                  borderRadius: 1,
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-data)",
                  color: "var(--text-secondary)",
                }}
              >
                7-day avg
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
              {todayCount} today
            </span>
            {yesterdayCount > 0 && (
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: "var(--font-data)",
                  background: isPositive ? "var(--success-dim)" : "var(--danger-dim)",
                  color: isPositive ? "var(--success)" : "var(--danger)",
                }}
              >
                {isPositive ? "+" : ""}{vsDelta}% vs yesterday
              </span>
            )}
          </div>
        </div>
      }
    >
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="barGradientSignups" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.7} />
                <stop offset="100%" stopColor="var(--brand)" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid {...CHART_GRID} />
            <XAxis
              dataKey="date"
              tick={CHART_AXIS_TICK}
              {...CHART_AXIS}
              tickFormatter={(v: string) => {
                const parts = v.split("-");
                return `${parts[1]}/${parts[2]}`;
              }}
            />
            <YAxis
              tick={CHART_AXIS_TICK}
              {...CHART_AXIS}
              width={30}
            />
            <Tooltip
              content={
                <CustomTooltip
                  colorMap={{ count: "var(--brand)", avg7d: "var(--text-muted)" }}
                />
              }
              cursor={{ fill: "var(--chart-cursor)" }}
            />
            <ReferenceLine
              y={avg}
              stroke="var(--text-muted)"
              strokeDasharray="4 2"
              label={{
                value: `Avg: ${avg}`,
                position: "right",
                fill: "var(--text-muted)",
                fontSize: 10,
                fontFamily: "var(--font-data)",
              }}
            />
            <Bar
              dataKey="count"
              name="Daily Signups"
              fill="url(#barGradientSignups)"
              radius={CHART_BAR_RADIUS}
              {...CHART_ANIMATION}
              label={({ x, y, width, index }: LabelProps) => {
                const nx = Number(x ?? 0);
                const ny = Number(y ?? 0);
                const nw = Number(width ?? 0);
                if (!peak || index !== peak.index) return <></>;
                return (
                  <g>
                    <rect
                      x={nx + nw / 2 - 32}
                      y={ny - 28}
                      width={64}
                      height={22}
                      rx={6}
                      fill="var(--surface-2)"
                      stroke="var(--brand)"
                      strokeWidth={1}
                    />
                    <text
                      x={nx + nw / 2}
                      y={ny - 14}
                      textAnchor="middle"
                      fill="var(--text-primary)"
                      fontSize={10}
                      fontFamily="var(--font-data)"
                    >
                      Peak {peak.value}
                    </text>
                  </g>
                );
              }}
            />
            <Line
              dataKey="avg7d"
              name="7-Day Avg"
              stroke="var(--text-muted)"
              strokeWidth={2}
              dot={false}
              connectNulls
              {...CHART_ANIMATION}
            />
            <Brush
              dataKey="date"
              height={30}
              stroke="var(--brand)"
              fill="var(--surface-2)"
              tickFormatter={(v: string) => {
                const parts = v.split("-");
                return `${parts[1]}/${parts[2]}`;
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
