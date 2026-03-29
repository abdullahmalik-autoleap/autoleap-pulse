"use client";

import { useState, useMemo } from "react";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";
import {
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { LazyBarChart as BarChart } from "@/components/charts/lazy";

interface RegionData {
  region: string;
  count: number;
  percentage: number;
  conversionRate: number;
  topState: string;
}

interface RegionalBreakdownProps {
  data: RegionData[];
  isLoading?: boolean;
}

function convRateColor(rate: number): string {
  if (rate >= 15) return "var(--success)";
  if (rate < 10) return "var(--danger)";
  return "var(--text-secondary)";
}

const BAR_FILL = "#0E7169";
const BAR_HOVER = "#11897f";

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: RegionData }[];
}

function RegionTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: "var(--chart-tooltip-bg)",
        border: "var(--chart-tooltip-border)",
        borderRadius: 8,
        padding: "8px 12px",
        fontFamily: "var(--font-data)",
        fontSize: 12,
      }}
    >
      <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>
        {d.region}
      </div>
      <div style={{ color: "var(--text-secondary)", marginTop: 2 }}>
        {d.count.toLocaleString()} signups · {d.percentage}% of total
      </div>
    </div>
  );
}

export function RegionalBreakdown({ data, isLoading }: RegionalBreakdownProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...data].sort((a, b) => b.count - a.count),
    [data],
  );

  if (isLoading) return <ChartSkeleton height={320} />;

  return (
    <ChartCard title="Regional Breakdown">
      <div className="regional-breakdown-layout">
        {/* LEFT — Data Table */}
        <div className="regional-table-side" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Region", "Signups", "% of Total", "Conv. Rate", "Top State"].map(
                  (h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr
                  key={row.region}
                  style={{
                    background:
                      hoveredRegion === row.region
                        ? "var(--surface-hover)"
                        : "transparent",
                    transition: "background 0.15s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={() => setHoveredRegion(row.region)}
                  onMouseLeave={() => setHoveredRegion(null)}
                >
                  <td style={{ ...tdStyle, fontWeight: 600, color: "var(--text-primary)" }}>
                    {row.region}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: "var(--text-primary)" }}>
                    {row.count.toLocaleString()}
                  </td>
                  <td style={tdStyle}>
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          width: 80,
                          height: 6,
                          borderRadius: 3,
                          background: "var(--surface-hover)",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            width: `${row.percentage}%`,
                            height: "100%",
                            borderRadius: 3,
                            background: BAR_FILL,
                            transition: "width 0.6s ease",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          fontFamily: "var(--font-data)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.percentage}%
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      color: convRateColor(row.conversionRate),
                      fontWeight: 600,
                    }}
                  >
                    {row.conversionRate}%
                  </td>
                  <td style={{ ...tdStyle, color: "var(--text-primary)" }}>
                    {row.topState}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vertical separator */}
        <div className="regional-separator" />

        {/* RIGHT — Horizontal Bar Chart */}
        <div className="regional-chart-side">
          <ResponsiveContainer width="100%" height={sorted.length * 40 + 20}>
            <BarChart
              data={sorted}
              layout="vertical"
              margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
              barSize={28}
              barGap={12}
            >
              <CartesianGrid
                horizontal={false}
                stroke="var(--pulse-border)"
                strokeDasharray="3 3"
              />
              <XAxis
                type="number"
                hide
              />
              <YAxis
                type="category"
                dataKey="region"
                axisLine={false}
                tickLine={false}
                width={90}
                tick={{
                  fontSize: 13,
                  fill: "var(--text-secondary)",
                  fontFamily: "var(--font-data)",
                }}
              />
              <Tooltip
                content={<RegionTooltip />}
                cursor={false}
              />
              <Bar
                dataKey="count"
                radius={[0, 4, 4, 0]}
                onMouseLeave={() => setHoveredRegion(null)}
              >
                {sorted.map((entry) => (
                  <Cell
                    key={entry.region}
                    fill={hoveredRegion === entry.region ? BAR_HOVER : BAR_FILL}
                    onMouseEnter={() => setHoveredRegion(entry.region)}
                    style={{ cursor: "pointer", transition: "fill 0.15s ease" }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ChartCard>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  fontSize: 10,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontFamily: "var(--font-data)",
  color: "var(--text-muted)",
  padding: "6px 8px",
  borderBottom: "1px solid var(--pulse-border)",
};

const tdStyle: React.CSSProperties = {
  fontSize: 13,
  fontFamily: "var(--font-data)",
  color: "var(--text-secondary)",
  padding: "8px 8px",
  whiteSpace: "nowrap",
};
