"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { BarChart3 } from "lucide-react";
import { CHART_GRID, CHART_AXIS_TICK, CHART_AXIS, CHART_ANIMATION, CHART_TOOLTIP_BG } from "@/lib/chartDefaults";

interface WaterfallItem {
  label: string;
  value: number;
  type: string;
}

interface MRRWaterfallChartProps {
  data: WaterfallItem[];
  currentMonth: string;
  isLoading?: boolean;
}

interface WaterfallDataPoint {
  label: string;
  invisible: number;
  visible: number;
  type: string;
  rawValue: number;
  topY: number;
}

const FILL_MAP: Record<string, string> = {
  base: "#0E7169",
  total: "#0E7169",
  positive: "rgba(14,113,105,0.75)",
  negative: "#EF4444",
};

function buildWaterfallData(items: WaterfallItem[]): WaterfallDataPoint[] {
  if (items.length === 0) return [];

  const result: WaterfallDataPoint[] = [];
  let runningBase = 0;

  for (const item of items) {
    if (item.type === "base" || item.type === "total") {
      result.push({
        label: item.label,
        invisible: 0,
        visible: item.value,
        type: item.type,
        rawValue: item.value,
        topY: item.value,
      });
      runningBase = item.type === "base" ? item.value : 0;
    } else if (item.type === "positive") {
      result.push({
        label: item.label,
        invisible: runningBase,
        visible: item.value,
        type: item.type,
        rawValue: item.value,
        topY: runningBase + item.value,
      });
      runningBase += item.value;
    } else {
      const absValue = Math.abs(item.value);
      runningBase -= absValue;
      result.push({
        label: item.label,
        invisible: runningBase,
        visible: absValue,
        type: item.type,
        rawValue: item.value,
        topY: runningBase + absValue,
      });
    }
  }

  return result;
}

interface ConnectorProps {
  formattedGraphicalItems?: Array<{
    props?: {
      data?: Array<{
        x?: number;
        y?: number;
        width?: number;
        height?: number;
      }>;
    };
  }>;
}

function WaterfallConnectors({ formattedGraphicalItems }: ConnectorProps) {
  const visibleBars = formattedGraphicalItems?.[1]?.props?.data;
  const invisibleBars = formattedGraphicalItems?.[0]?.props?.data;
  if (!visibleBars || !invisibleBars) return null;

  const lines: React.ReactElement[] = [];
  for (let i = 0; i < visibleBars.length - 1; i++) {
    const currBar = visibleBars[i];
    const currInvis = invisibleBars[i];
    const nextInvis = invisibleBars[i + 1];
    const nextBar = visibleBars[i + 1];

    if (!currBar || !currInvis || !nextInvis || !nextBar) continue;

    const currX = (currBar.x ?? 0) + (currBar.width ?? 0);
    const currTopY = currInvis.y ?? 0;
    const nextX = nextBar.x ?? 0;
    const nextTopY = nextInvis.y ?? 0;

    lines.push(
      <line
        key={`connector-${i}`}
        x1={currX}
        y1={currTopY}
        x2={nextX}
        y2={nextTopY}
        stroke="var(--pulse-border)"
        strokeWidth={1}
        strokeDasharray="4 3"
      />,
    );
  }

  return <g>{lines}</g>;
}

interface ValueLabelProps {
  x?: string | number;
  y?: string | number;
  width?: string | number;
  index?: number;
}

export function MRRWaterfallChart({ data, currentMonth, isLoading }: MRRWaterfallChartProps) {
  if (isLoading) return <ChartSkeleton height={300} />;

  if (!data || data.length === 0) {
    return (
      <ChartCard title="MRR Movement">
        <EmptyState icon={BarChart3} message="No waterfall data for this period" />
      </ChartCard>
    );
  }

  const chartData = useMemo(() => buildWaterfallData(data), [data]);

  const startingMRR = data.find((d) => d.type === "base")?.value ?? 0;
  const endingMRR = data.find((d) => d.type === "total")?.value ?? 0;
  const netChange = endingMRR - startingMRR;
  const netChangePct = startingMRR > 0 ? (netChange / startingMRR) * 100 : 0;
  const isNetPositive = netChange >= 0;

  return (
    <ChartCard
      title={`MRR Movement — ${currentMonth}`}
      subtitle="Waterfall breakdown of MRR changes"
    >
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="20%">
            <CartesianGrid {...CHART_GRID} />
            <XAxis
              dataKey="label"
              tick={{ ...CHART_AXIS_TICK, fontSize: 10 }}
              {...CHART_AXIS}
            />
            <YAxis
              tick={CHART_AXIS_TICK}
              {...CHART_AXIS}
              width={50}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0]?.payload as WaterfallDataPoint | undefined;
                if (!item) return null;
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
                    <p style={{ color: "var(--text-muted)", marginBottom: 4 }}>{item.label}</p>
                    <p style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      ${(item.rawValue / 1000).toFixed(1)}K
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="invisible" stackId="stack" fill="transparent" isAnimationActive={false} />
            <Bar
              dataKey="visible"
              stackId="stack"
              radius={[4, 4, 0, 0]}
              {...CHART_ANIMATION}
              label={({ x, y, width, index }: ValueLabelProps) => {
                const nx = Number(x ?? 0);
                const ny = Number(y ?? 0);
                const nw = Number(width ?? 0);
                const idx = index ?? 0;
                const point = chartData[idx];
                if (!point) return <g />;
                return (
                  <text
                    x={nx + nw / 2}
                    y={ny - 8}
                    textAnchor="middle"
                    fill="var(--text-primary)"
                    fontSize={11}
                    fontFamily="var(--font-data)"
                    fontWeight={600}
                  >
                    ${(point.rawValue / 1000).toFixed(1)}K
                  </text>
                );
              }}
            >
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={FILL_MAP[entry.type] ?? FILL_MAP.positive} />
              ))}
            </Bar>
            <WaterfallConnectors />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div
        className="flex items-center justify-center gap-3 flex-wrap"
        style={{
          marginTop: 16,
          padding: "10px 16px",
          background: "var(--surface-2)",
          borderRadius: 8,
          fontFamily: "var(--font-data)",
          fontSize: 12,
        }}
      >
        <span style={{ color: "var(--text-secondary)" }}>
          Starting MRR{" "}
          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            ${(startingMRR / 1000).toFixed(1)}k
          </span>
        </span>
        <span style={{ color: "var(--text-muted)" }}>→</span>
        <span style={{ color: "var(--text-secondary)" }}>
          Ending MRR{" "}
          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            ${(endingMRR / 1000).toFixed(1)}k
          </span>
        </span>
        <span
          style={{
            width: 1,
            height: 16,
            background: "var(--pulse-border)",
          }}
        />
        <span style={{ color: "var(--text-secondary)" }}>
          Net Change:{" "}
          <span
            style={{
              fontWeight: 600,
              color: isNetPositive ? "var(--brand)" : "var(--danger)",
            }}
          >
            {isNetPositive ? "+" : ""}${(netChange / 1000).toFixed(1)}k ({isNetPositive ? "+" : ""}
            {netChangePct.toFixed(1)}%)
          </span>
        </span>
      </div>
    </ChartCard>
  );
}
