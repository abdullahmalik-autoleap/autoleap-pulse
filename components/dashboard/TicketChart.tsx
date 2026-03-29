"use client";

import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { LazyBarChart as BarChart } from "@/components/charts/lazy";
import { ChartCard } from "./ChartCard";
import { CustomTooltip } from "./CustomTooltip";
import { EmptyState } from "./EmptyState";
import { ChartSkeleton } from "./ChartSkeleton";
import { HeadphonesIcon } from "lucide-react";
import { CHART_GRID, CHART_AXIS_TICK, CHART_AXIS, CHART_BAR_RADIUS, CHART_ANIMATION } from "@/lib/chartDefaults";

interface TicketDataPoint {
  date: string;
  opened: number;
  resolved: number;
}

interface TicketChartProps {
  data?: TicketDataPoint[];
  isLoading?: boolean;
}

function StatusBadge({ data }: { data: TicketDataPoint[] }) {
  if (data.length === 0) return null;
  const last = data[data.length - 1];
  const ratio = last.opened > 0 ? (last.opened - last.resolved) / last.opened : 0;

  if (last.resolved > last.opened) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
        style={{
          fontSize: 11,
          fontWeight: 600,
          fontFamily: "var(--font-data)",
          background: "var(--success-dim)",
          color: "var(--success)",
        }}
      >
        ✓ Clearing
      </span>
    );
  }

  if (ratio > 0.2) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
        style={{
          fontSize: 11,
          fontWeight: 600,
          fontFamily: "var(--font-data)",
          background: "var(--warning-dim)",
          color: "var(--warning)",
        }}
      >
        ⚠ Backlog building
      </span>
    );
  }

  return null;
}

export function TicketChart({ data, isLoading }: TicketChartProps) {
  if (isLoading) return <ChartSkeleton />;

  if (!data || data.length === 0) {
    return (
      <ChartCard title="Support Tickets">
        <EmptyState icon={HeadphonesIcon} message="No ticket data for this period" />
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Support Tickets"
      headerRight={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--danger)",
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
              Opened
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--brand)",
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
              Resolved
            </span>
          </div>
          <StatusBadge data={data} />
        </div>
      }
    >
      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4}>
            <CartesianGrid {...CHART_GRID} />
            <XAxis
              dataKey="date"
              tick={CHART_AXIS_TICK}
              {...CHART_AXIS}
            />
            <YAxis
              tick={CHART_AXIS_TICK}
              {...CHART_AXIS}
              width={30}
            />
            <Tooltip
              content={
                <CustomTooltip
                  colorMap={{ opened: "var(--danger)", resolved: "var(--brand)" }}
                />
              }
              cursor={{ fill: "var(--chart-cursor)" }}
            />
            <Bar
              dataKey="opened"
              name="Opened"
              fill="var(--danger)"
              fillOpacity={0.5}
              radius={CHART_BAR_RADIUS}
              {...CHART_ANIMATION}
            />
            <Bar
              dataKey="resolved"
              name="Resolved"
              fill="var(--brand)"
              radius={CHART_BAR_RADIUS}
              {...CHART_ANIMATION}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
