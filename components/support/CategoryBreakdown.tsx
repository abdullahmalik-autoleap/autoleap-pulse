"use client";

import { useState, useMemo } from "react";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { LazyBarChart as BarChart } from "@/components/charts/lazy";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { FolderOpen } from "lucide-react";
import { CHART_GRID, CHART_AXIS_TICK, CHART_AXIS, CHART_BAR_RADIUS, CHART_ANIMATION, CHART_TOOLTIP_BG } from "@/lib/chartDefaults";

interface CategoryData {
  category: string;
  count: number;
  percentage: number;
  avgResolutionHrs: number;
  csatAvg: number;
  prevCount: number;
}

interface CategoryBreakdownProps {
  data: CategoryData[];
  isLoading?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  Billing: "var(--brand)",
  "Sync Issues": "var(--info)",
  "Bug Reports": "var(--danger)",
  "Feature Requests": "var(--warning)",
  Onboarding: "#8B5CF6",
  General: "var(--text-muted)",
};

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? "var(--brand)";
}

function calcChange(current: number, prev: number): number {
  if (prev === 0) return current > 0 ? 100 : 0;
  return +((current - prev) / prev * 100).toFixed(1);
}

export function CategoryBreakdown({ data, isLoading }: CategoryBreakdownProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const chartData = useMemo(() => {
    const filtered = selectedCategory
      ? data.filter((d) => d.category === selectedCategory)
      : data;
    return filtered.map((d) => ({
      category: d.category,
      current: d.count,
      previous: d.prevCount,
    }));
  }, [data, selectedCategory]);

  if (isLoading) return <ChartSkeleton height={320} />;

  return (
    <ChartCard
      title="Tickets by Category"
      subtitle="Volume and performance by category"
    >
      <div
        className="grid"
        style={{ gridTemplateColumns: "40% 60%", gap: 20, minHeight: 260 }}
      >
        {/* LEFT: Category Table */}
        <div>
          <div
            style={{
              overflowX: "auto",
              borderRadius: 8,
              border: "1px solid var(--pulse-border)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: "var(--font-data)",
                fontSize: 12,
              }}
            >
              <thead>
                <tr>
                  {["Category", "Volume", "Avg Res.", "vs Last"].map((h) => (
                    <th
                      key={h}
                      style={{
                        background: "var(--surface-2)",
                        padding: "8px 10px",
                        textAlign: h === "Category" ? "left" : "right",
                        fontWeight: 600,
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "var(--text-muted)",
                        borderBottom: "1px solid var(--pulse-border)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((cat) => {
                  const isSelected = selectedCategory === cat.category;
                  const change = calcChange(cat.count, cat.prevCount);
                  const changePositive = change >= 0;

                  return (
                    <tr
                      key={cat.category}
                      onClick={() =>
                        setSelectedCategory(isSelected ? null : cat.category)
                      }
                      style={{
                        cursor: "pointer",
                        background: isSelected ? "var(--brand-dim)" : "transparent",
                        borderLeft: isSelected ? "2px solid var(--brand)" : "2px solid transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "var(--surface-3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isSelected ? "var(--brand-dim)" : "transparent";
                      }}
                    >
                      <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--pulse-border)" }}>
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5"
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            background: `${getCategoryColor(cat.category)}20`,
                            color: getCategoryColor(cat.category),
                          }}
                        >
                          {cat.category}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          textAlign: "right",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          borderBottom: "1px solid var(--pulse-border)",
                        }}
                      >
                        {cat.count}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          textAlign: "right",
                          color: "var(--text-secondary)",
                          borderBottom: "1px solid var(--pulse-border)",
                        }}
                      >
                        {cat.avgResolutionHrs}h
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          textAlign: "right",
                          fontWeight: 600,
                          color: changePositive ? "var(--danger)" : "var(--success)",
                          borderBottom: "1px solid var(--pulse-border)",
                          fontSize: 11,
                        }}
                      >
                        {changePositive ? "▲" : "▼"} {Math.abs(change)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: Grouped Bar Chart */}
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-1.5">
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--brand)", display: "inline-block" }} />
              <span style={{ fontSize: 11, fontFamily: "var(--font-data)", color: "var(--text-secondary)" }}>This Period</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--chart-brand-grad-start)", display: "inline-block" }} />
              <span style={{ fontSize: 11, fontFamily: "var(--font-data)", color: "var(--text-secondary)" }}>Last Period</span>
            </div>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={2}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--chart-grid)"
                  vertical={false}
                />
                <XAxis
                  dataKey="category"
                  tick={{ fill: "var(--text-muted)", fontSize: 9, fontFamily: "var(--font-data)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "var(--font-data)" }}
                  axisLine={false}
                  tickLine={false}
                  width={25}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div
                        style={{
                          background: "var(--chart-tooltip-bg)",
                          border: "var(--chart-tooltip-border)",
                          borderRadius: 8,
                          padding: "10px 14px",
                          fontFamily: "var(--font-data)",
                          fontSize: 12,
                        }}
                      >
                        <p style={{ color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
                        {payload.map((entry, idx) => (
                          <div key={idx} className="flex items-center gap-2" style={{ marginTop: 3 }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: entry.color }} />
                            <span style={{ color: "var(--text-secondary)" }}>{entry.name}</span>
                            <span style={{ color: "var(--text-primary)", fontWeight: 600, marginLeft: "auto" }}>
                              {entry.value as number}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                  cursor={{ fill: "var(--chart-cursor)" }}
                />
                <Bar
                  dataKey="current"
                  name="This Period"
                  fill="var(--brand)"
                  radius={[3, 3, 0, 0]}
                  {...CHART_ANIMATION}
                />
                <Bar
                  dataKey="previous"
                  name="Last Period"
                  fill="var(--chart-brand-grad-start)"
                  radius={[3, 3, 0, 0]}
                  {...CHART_ANIMATION}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
