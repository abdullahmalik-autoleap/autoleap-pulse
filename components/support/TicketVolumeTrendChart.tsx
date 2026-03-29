"use client";

import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { LazyComposedChart as ComposedChart } from "@/components/charts/lazy";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Inbox } from "lucide-react";
import { CHART_GRID, CHART_AXIS_TICK, CHART_AXIS, CHART_BAR_RADIUS, CHART_ANIMATION, CHART_TOOLTIP_BG } from "@/lib/chartDefaults";

interface TicketTrendPoint {
  date: string;
  opened: number;
  resolved: number;
  backlog: number;
}

interface TicketVolumeTrendChartProps {
  data: TicketTrendPoint[];
  isLoading?: boolean;
}

export function TicketVolumeTrendChart({ data, isLoading }: TicketVolumeTrendChartProps) {
  if (isLoading) return <ChartSkeleton height={260} />;

  if (!data || data.length === 0) {
    return (
      <ChartCard title="Ticket Volume Trend">
        <EmptyState icon={Inbox} message="No ticket data for this period" />
      </ChartCard>
    );
  }

  const latestBacklog = data.length > 0 ? data[data.length - 1].backlog : 0;
  const backlogColor = latestBacklog > 30 ? "var(--danger)" : latestBacklog > 15 ? "var(--warning)" : "var(--brand)";

  return (
    <ChartCard
      title="Ticket Volume Trend"
      subtitle="Daily opened, resolved, and backlog"
      headerRight={
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1"
          style={{
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "var(--font-data)",
            background: latestBacklog > 30 ? "var(--danger-dim)" : latestBacklog > 15 ? "var(--warning-dim)" : "var(--brand-dim)",
            color: backlogColor,
          }}
        >
          Backlog: {latestBacklog} tickets
        </span>
      }
    >
      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} barGap={2}>
            <defs>
              <linearGradient id="openedBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--danger)" stopOpacity={0.6} />
                <stop offset="100%" stopColor="var(--danger)" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="resolvedBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.6} />
                <stop offset="100%" stopColor="var(--brand)" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid {...CHART_GRID} />
            <XAxis
              dataKey="date"
              tick={CHART_AXIS_TICK}
              {...CHART_AXIS}
            />
            <YAxis
              yAxisId="left"
              tick={CHART_AXIS_TICK}
              {...CHART_AXIS}
              width={30}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={CHART_AXIS_TICK}
              {...CHART_AXIS}
              width={30}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const opened = payload.find((p) => p.dataKey === "opened")?.value as number ?? 0;
                const resolved = payload.find((p) => p.dataKey === "resolved")?.value as number ?? 0;
                const backlog = payload.find((p) => p.dataKey === "backlog")?.value as number ?? 0;
                const idx = data.findIndex((d) => d.date === label);
                const prevBacklog = idx > 0 ? data[idx - 1].backlog : backlog;
                const backlogDelta = backlog - prevBacklog;
                return (
                  <div
                    style={{
                      background: CHART_TOOLTIP_BG,
                      border: "var(--chart-tooltip-border)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      fontFamily: "var(--font-data)",
                      fontSize: 12,
                    }}
                  >
                    <p style={{ color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
                    <div className="flex items-center gap-2" style={{ marginTop: 3 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--danger)" }} />
                      <span style={{ color: "var(--text-secondary)" }}>Opened</span>
                      <span style={{ color: "var(--text-primary)", fontWeight: 600, marginLeft: "auto" }}>{opened}</span>
                    </div>
                    <div className="flex items-center gap-2" style={{ marginTop: 3 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--brand)" }} />
                      <span style={{ color: "var(--text-secondary)" }}>Resolved</span>
                      <span style={{ color: "var(--text-primary)", fontWeight: 600, marginLeft: "auto" }}>{resolved}</span>
                    </div>
                    <div className="flex items-center gap-2" style={{ marginTop: 3 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--warning)" }} />
                      <span style={{ color: "var(--text-secondary)" }}>Backlog</span>
                      <span style={{ color: "var(--text-primary)", fontWeight: 600, marginLeft: "auto" }}>
                        {backlog}
                        {backlogDelta !== 0 && (
                          <span style={{ color: backlogDelta > 0 ? "var(--danger)" : "var(--success)", marginLeft: 4, fontSize: 10 }}>
                            {backlogDelta > 0 ? "▲" : "▼"}{Math.abs(backlogDelta)}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              }}
              cursor={{ fill: "var(--chart-cursor)" }}
            />
            <ReferenceLine
              yAxisId="right"
              y={0}
              stroke="var(--text-muted)"
              strokeDasharray="4 2"
              label={{
                value: "Cleared",
                position: "right",
                fill: "var(--text-muted)",
                fontSize: 9,
                fontFamily: "var(--font-data)",
              }}
            />
            <Bar
              yAxisId="left"
              dataKey="opened"
              name="Opened"
              fill="url(#openedBarGrad)"
              radius={CHART_BAR_RADIUS}
              {...CHART_ANIMATION}
            />
            <Bar
              yAxisId="left"
              dataKey="resolved"
              name="Resolved"
              fill="url(#resolvedBarGrad)"
              radius={CHART_BAR_RADIUS}
              {...CHART_ANIMATION}
            />
            <Line
              yAxisId="right"
              dataKey="backlog"
              name="Backlog"
              stroke="var(--warning)"
              strokeWidth={2}
              dot={false}
              {...CHART_ANIMATION}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
