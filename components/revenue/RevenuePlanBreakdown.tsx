"use client";

import {
  Area,
  ResponsiveContainer,
} from "recharts";
import { LazyAreaChart as AreaChart } from "@/components/charts/lazy";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Layers } from "lucide-react";
import { CHART_ANIMATION } from "@/lib/chartDefaults";

interface PlanData {
  plan: string;
  revenue: number;
  percentage: number;
  shopCount: number;
  arpu: number;
}

interface PlanMixTrendPoint {
  month: string;
  starter: number;
  pro: number;
  enterprise: number;
}

interface RevenuePlanBreakdownProps {
  plans: PlanData[];
  planMixTrend: PlanMixTrendPoint[];
  isLoading?: boolean;
}

const PLAN_CONFIG: Record<string, { label: string; color: string; dimColor: string }> = {
  starter: { label: "Starter", color: "var(--chart-brand-grad-start)", dimColor: "var(--brand-dim)" },
  pro: { label: "Pro", color: "var(--brand)", dimColor: "var(--brand-dim)" },
  enterprise: { label: "Enterprise", color: "var(--brand-hover)", dimColor: "var(--brand-dim)" },
};

export function RevenuePlanBreakdown({ plans, planMixTrend, isLoading }: RevenuePlanBreakdownProps) {
  if (isLoading) return <ChartSkeleton height={300} />;

  if (!plans || plans.length === 0) {
    return (
      <ChartCard title="Revenue by Plan">
        <EmptyState icon={Layers} message="No plan data for this period" />
      </ChartCard>
    );
  }

  const maxRevenue = Math.max(...plans.map((p) => p.revenue), 1);

  return (
    <ChartCard
      title="Revenue by Plan"
      subtitle="Current plan tier distribution"
    >
      <div className="flex flex-col" style={{ gap: 10 }}>
        {plans.map((plan) => {
          const config = PLAN_CONFIG[plan.plan] ?? {
            label: plan.plan,
            color: "var(--brand)",
            dimColor: "var(--brand-dim)",
          };
          const barWidth = (plan.revenue / maxRevenue) * 100;

          return (
            <div
              key={plan.plan}
              style={{
                background: "var(--surface-2)",
                borderRadius: 10,
                padding: "14px 16px",
                border: "1px solid var(--pulse-border)",
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5"
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: "var(--font-data)",
                      background: config.dimColor,
                      color: config.color,
                    }}
                  >
                    {config.label}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--font-data)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {plan.shopCount} shops
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        fontFamily: "var(--font-data)",
                        color: "var(--text-primary)",
                      }}
                    >
                      ${(plan.revenue / 1000).toFixed(1)}k
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontFamily: "var(--font-data)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      ${plan.arpu.toFixed(0)}/mo
                    </div>
                  </div>
                  <div style={{ textAlign: "right", minWidth: 36 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: "var(--font-data)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {plan.percentage}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue bar */}
              <div
                style={{
                  height: 6,
                  background: "var(--surface-3)",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${barWidth}%`,
                    background: config.color,
                    borderRadius: 3,
                    transition: "width 800ms ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan Mix Trend */}
      {planMixTrend.length > 1 && (
        <div style={{ marginTop: 16 }}>
          <p
            style={{
              fontSize: 11,
              fontFamily: "var(--font-data)",
              color: "var(--text-muted)",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Plan Mix Trend
          </p>
          <div style={{ height: 80 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={planMixTrend} stackOffset="expand">
                <defs>
                  <linearGradient id="starterGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-brand-grad-start)" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="var(--chart-brand-grad-start)" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="proGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="enterpriseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand-hover)" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="var(--brand-hover)" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="starter"
                  stackId="1"
                  stroke="var(--chart-brand-grad-start)"
                  strokeWidth={0}
                  fill="url(#starterGrad)"
                  {...CHART_ANIMATION}
                />
                <Area
                  type="monotone"
                  dataKey="pro"
                  stackId="1"
                  stroke="var(--brand)"
                  strokeWidth={0}
                  fill="url(#proGrad)"
                  {...CHART_ANIMATION}
                />
                <Area
                  type="monotone"
                  dataKey="enterprise"
                  stackId="1"
                  stroke="var(--brand-hover)"
                  strokeWidth={0}
                  fill="url(#enterpriseGrad)"
                  {...CHART_ANIMATION}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </ChartCard>
  );
}
