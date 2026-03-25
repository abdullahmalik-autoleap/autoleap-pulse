"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { CustomTooltip } from "@/components/dashboard/CustomTooltip";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { TrendingUp } from "lucide-react";
import { CHART_GRID, CHART_AXIS_TICK, CHART_AXIS, CHART_BAR_RADIUS, CHART_ANIMATION } from "@/lib/chartDefaults";

interface MRRTrendPoint {
  month: string;
  mrr: number;
  arr: number;
}

interface MRRTrendChartProps {
  data: MRRTrendPoint[];
  currentMRR: number;
  mrrDelta: number;
  isLoading?: boolean;
}

interface LabelProps {
  x?: string | number;
  y?: string | number;
  width?: string | number;
  index?: number;
}

export function MRRTrendChart({ data, currentMRR, mrrDelta, isLoading }: MRRTrendChartProps) {
  if (isLoading) return <ChartSkeleton height={280} />;

  if (!data || data.length === 0) {
    return (
      <ChartCard title="MRR Trend">
        <EmptyState icon={TrendingUp} message="No MRR data for this period" />
      </ChartCard>
    );
  }

  const chartData = useMemo(() => {
    return data.map((d, i) => {
      const prevMrr = i > 0 ? data[i - 1].mrr : d.mrr;
      const momGrowth = prevMrr > 0 ? ((d.mrr - prevMrr) / prevMrr) * 100 : 0;
      return {
        ...d,
        arrLine: +(d.arr / 12).toFixed(2),
        momGrowth: +momGrowth.toFixed(1),
        prevYearMrr: i >= 12 ? data[i - 12].mrr : undefined,
      };
    });
  }, [data]);

  const isPositive = mrrDelta >= 0;

  const yoyPairs = useMemo(() => {
    if (data.length < 13) return [];
    return chartData
      .filter((d) => d.prevYearMrr !== undefined)
      .map((d) => ({
        month: d.month,
        mrr: d.mrr,
        prevYearMrr: d.prevYearMrr!,
      }));
  }, [data, chartData]);

  const firstYoY = yoyPairs.length > 0 ? yoyPairs[0].month : undefined;
  const lastYoY = yoyPairs.length > 0 ? yoyPairs[yoyPairs.length - 1].month : undefined;

  return (
    <ChartCard
      title="MRR Trend"
      subtitle="Monthly Recurring Revenue over time"
      headerRight={
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: "#0E7169",
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
                MRR
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                style={{
                  width: 14,
                  height: 2,
                  background: "rgba(255,255,255,0.6)",
                  display: "inline-block",
                  borderRadius: 1,
                  borderTop: "1px dashed rgba(255,255,255,0.6)",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-data)",
                  color: "var(--text-secondary)",
                }}
              >
                ARR/12
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                fontFamily: "var(--font-data)",
                color: "var(--text-primary)",
                letterSpacing: -0.5,
              }}
            >
              ${(currentMRR / 1000).toFixed(1)}K
            </span>
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
              {isPositive ? "+" : ""}{mrrDelta.toFixed(1)}% MoM
            </span>
          </div>
        </div>
      }
    >
      <div style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="mrrBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(14,113,105,0.9)" />
                <stop offset="100%" stopColor="rgba(14,113,105,0.3)" />
              </linearGradient>
            </defs>
            <CartesianGrid {...CHART_GRID} />
            <XAxis
              dataKey="month"
              tick={CHART_AXIS_TICK}
              {...CHART_AXIS}
              tickFormatter={(v: string) => v.split(" ")[0]}
            />
            <YAxis
              yAxisId="left"
              tick={CHART_AXIS_TICK}
              {...CHART_AXIS}
              width={45}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={CHART_AXIS_TICK}
              {...CHART_AXIS}
              width={45}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              content={
                <CustomTooltip
                  colorMap={{ mrr: "#0E7169", arrLine: "rgba(255,255,255,0.6)" }}
                />
              }
              cursor={{ fill: "rgba(255,255,255,0.02)" }}
            />
            {firstYoY && lastYoY && (
              <ReferenceArea
                yAxisId="left"
                x1={firstYoY}
                x2={lastYoY}
                fill="rgba(14,113,105,0.06)"
                strokeOpacity={0}
              />
            )}
            <Bar
              yAxisId="left"
              dataKey="mrr"
              name="MRR"
              fill="url(#mrrBarGradient)"
              radius={CHART_BAR_RADIUS}
              {...CHART_ANIMATION}
              label={({ x, y, width, index }: LabelProps) => {
                const nx = Number(x ?? 0);
                const ny = Number(y ?? 0);
                const nw = Number(width ?? 0);
                const idx = index ?? 0;
                const point = chartData[idx];
                if (!point || idx === 0) return <g />;

                const growth = point.momGrowth;

                if (growth > 5) {
                  return (
                    <text
                      x={nx + nw / 2}
                      y={ny - 6}
                      textAnchor="middle"
                      fill="#0E7169"
                      fontSize={9}
                      fontFamily="var(--font-data)"
                      fontWeight={600}
                    >
                      ▲ {growth.toFixed(0)}%
                    </text>
                  );
                }

                if (growth >= 0 && growth < 2) {
                  return (
                    <text
                      x={nx + nw / 2}
                      y={ny - 6}
                      textAnchor="middle"
                      fill="#F59E0B"
                      fontSize={10}
                      fontFamily="var(--font-data)"
                      fontWeight={700}
                    >
                      !
                    </text>
                  );
                }

                return <g />;
              }}
            />
            <Line
              yAxisId="right"
              dataKey="arrLine"
              name="ARR/12"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={false}
              {...CHART_ANIMATION}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
