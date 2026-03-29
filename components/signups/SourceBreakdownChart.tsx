"use client";

import {
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { LazyBarChart as BarChart } from "@/components/charts/lazy";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { CustomTooltip } from "@/components/dashboard/CustomTooltip";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Share2 } from "lucide-react";
import { CHART_AXIS, CHART_ANIMATION, CHART_TOOLTIP_BG } from "@/lib/chartDefaults";

interface BySource {
  source: string;
  count: number;
  conversions: number;
  conversionRate: number;
}

interface SourceBreakdownChartProps {
  data: BySource[];
  isLoading?: boolean;
}

const SOURCE_LABELS: Record<string, string> = {
  organic: "Organic",
  paid_search: "Paid Search",
  referral: "Referral",
  direct: "Direct",
  social: "Social",
  partner: "Partner",
};

function BarLabel(props: Record<string, unknown>) {
  const { x, y, width, value } = props as {
    x: number;
    y: number;
    width: number;
    value: number;
  };
  return (
    <text
      x={x + width + 6}
      y={y + 10}
      fill="var(--text-secondary)"
      fontSize={10}
      fontFamily="var(--font-data)"
    >
      {value}
    </text>
  );
}

export function SourceBreakdownChart({ data, isLoading }: SourceBreakdownChartProps) {
  if (isLoading) return <ChartSkeleton height={280} />;

  if (!data || data.length === 0) {
    return (
      <ChartCard title="Acquisition Sources">
        <EmptyState icon={Share2} message="No source data for this period" />
      </ChartCard>
    );
  }

  const best = data.reduce(
    (max, d) => (d.conversionRate > max.conversionRate ? d : max),
    data[0] ?? { source: "", conversionRate: 0 },
  );

  const chartData = data.map((d) => ({
    ...d,
    label: SOURCE_LABELS[d.source] ?? d.source,
  }));

  return (
    <ChartCard
      title="Acquisition Sources"
      headerRight={
        best.source ? (
          <span
            className="inline-flex items-center rounded-full px-2.5 py-1"
            style={{
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "var(--font-data)",
              background: "var(--brand-dim)",
              color: "var(--brand)",
            }}
          >
            Best: {SOURCE_LABELS[best.source] ?? best.source}
          </span>
        ) : undefined
      }
    >
      <div style={{ height: Math.max(chartData.length * 40 + 20, 120) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            barGap={4}
            barCategoryGap="25%"
            margin={{ left: 0, right: 40 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              tick={{
                fill: "var(--text-secondary)",
                fontSize: 11,
                fontFamily: "var(--font-data)",
              }}
              {...CHART_AXIS}
              width={80}
            />
            <Tooltip
              content={
                <CustomTooltip
                  colorMap={{ count: "var(--brand)", conversions: "var(--brand-dim)" }}
                />
              }
              cursor={{ fill: "var(--chart-cursor)" }}
            />
            <Bar
              dataKey="count"
              name="Signups"
              fill="var(--brand)"
              radius={[0, 3, 3, 0]}
              barSize={12}
              {...CHART_ANIMATION}
              label={<BarLabel />}
            />
            <Bar
              dataKey="conversions"
              name="Conversions"
              fill="var(--chart-brand-grad-start)"
              radius={[0, 3, 3, 0]}
              barSize={12}
              {...CHART_ANIMATION}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Conversion rate table */}
      <div style={{ marginTop: 12, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Source", "Signups", "Conv.", "Rate"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontFamily: "var(--font-data)",
                    color: "var(--text-muted)",
                    padding: "4px 6px",
                    borderBottom: "1px solid var(--pulse-border)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const isBest = row.source === best.source;
              return (
                <tr
                  key={row.source}
                  style={{
                    background: isBest
                      ? "var(--brand-dim)"
                      : i % 2 === 1
                        ? "var(--chart-cursor)"
                        : "transparent",
                  }}
                >
                  <td style={tblCell}>
                    {SOURCE_LABELS[row.source] ?? row.source}
                  </td>
                  <td style={tblCell}>{row.count}</td>
                  <td style={tblCell}>{row.conversions}</td>
                  <td
                    style={{
                      ...tblCell,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {row.conversionRate}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}

const tblCell: React.CSSProperties = {
  fontSize: 12,
  fontFamily: "var(--font-data)",
  color: "var(--text-secondary)",
  padding: "5px 6px",
  whiteSpace: "nowrap",
};
