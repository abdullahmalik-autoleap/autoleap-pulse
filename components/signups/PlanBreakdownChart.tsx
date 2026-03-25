"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { PieChartIcon } from "lucide-react";
import { CHART_ANIMATION, CHART_TOOLTIP_BG } from "@/lib/chartDefaults";

interface ByPlan {
  plan: string;
  count: number;
  percentage: number;
}

interface PlanBreakdownChartProps {
  data: ByPlan[];
  isLoading?: boolean;
}

const PLAN_CONFIG: Record<string, { color: string; label: string }> = {
  starter: { color: "rgba(14,113,105,0.4)", label: "Starter" },
  pro: { color: "#0E7169", label: "Pro" },
  enterprise: { color: "#3B82F6", label: "Enterprise" },
};

function PlanTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ByPlan & { fill: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
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
      <p style={{ color: "var(--text-primary)", fontWeight: 600 }}>
        {PLAN_CONFIG[d.plan]?.label ?? d.plan}
      </p>
      <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>
        {d.count} signups ({d.percentage}%)
      </p>
    </div>
  );
}

export function PlanBreakdownChart({ data, isLoading }: PlanBreakdownChartProps) {
  if (isLoading) return <ChartSkeleton height={280} />;

  if (!data || data.length === 0) {
    return (
      <ChartCard title="By Plan">
        <EmptyState icon={PieChartIcon} message="No plan data for this period" />
      </ChartCard>
    );
  }

  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <ChartCard title="By Plan">
      <div style={{ position: "relative", height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="plan"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              {...CHART_ANIMATION}
            >
              {data.map((d) => (
                <Cell
                  key={d.plan}
                  fill={PLAN_CONFIG[d.plan]?.color ?? "#6B7280"}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip content={<PlanTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              fontFamily: "var(--font-data)",
              color: "var(--text-primary)",
              lineHeight: 1,
            }}
          >
            {total}
          </div>
          <div
            style={{
              fontSize: 10,
              fontFamily: "var(--font-data)",
              color: "var(--text-muted)",
              marginTop: 2,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            signups
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2" style={{ marginTop: 8 }}>
        {data.map((d) => {
          const config = PLAN_CONFIG[d.plan];
          return (
            <div key={d.plan} className="flex items-center gap-3">
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: config?.color ?? "#6B7280",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "var(--font-data)",
                  color: "var(--text-secondary)",
                  flex: 1,
                }}
              >
                {config?.label ?? d.plan}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "var(--font-data)",
                  color: "var(--text-primary)",
                }}
              >
                {d.count}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-data)",
                  color: "var(--text-muted)",
                  minWidth: 40,
                  textAlign: "right",
                }}
              >
                {d.percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
