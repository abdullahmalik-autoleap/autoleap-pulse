"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Star } from "lucide-react";
import { CHART_ANIMATION } from "@/lib/chartDefaults";

interface CSATTrendPoint {
  date: string;
  score: number;
}

interface CSATDistributionPoint {
  rating: number;
  count: number;
}

interface CSATChartProps {
  score: number;
  trend: CSATTrendPoint[];
  distribution: CSATDistributionPoint[];
  isLoading?: boolean;
}

const STAR_COLORS: Record<number, string> = {
  5: "var(--brand)",
  4: "var(--brand)",
  3: "var(--warning)",
  2: "var(--danger)",
  1: "var(--danger)",
};

function StarVisual({ score }: { score: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const filled = score >= i;
    const half = !filled && score >= i - 0.5;
    stars.push(
      <svg key={i} width={20} height={20} viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id={`starGrad-${i}`}>
            <stop offset="50%" stopColor={filled || half ? "#0E7169" : "var(--surface-3)"} />
            <stop offset="50%" stopColor={filled ? "#0E7169" : "var(--surface-3)"} />
          </linearGradient>
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={`url(#starGrad-${i})`}
        />
      </svg>,
    );
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

export function CSATChart({ score, trend, distribution, isLoading }: CSATChartProps) {
  if (isLoading) return <ChartSkeleton height={380} />;

  if (distribution.length === 0 && trend.length === 0) {
    return (
      <ChartCard title="Customer Satisfaction">
        <EmptyState icon={Star} message="No CSAT data for this period" />
      </ChartCard>
    );
  }

  const totalReviews = useMemo(
    () => distribution.reduce((s, d) => s + d.count, 0),
    [distribution],
  );

  const maxCount = useMemo(
    () => Math.max(...distribution.map((d) => d.count), 1),
    [distribution],
  );

  const scoreColor = score >= 4.0 ? "var(--brand)" : score >= 3.5 ? "var(--warning)" : "var(--danger)";

  return (
    <ChartCard
      title="Customer Satisfaction"
      subtitle="CSAT score and rating distribution"
    >
      <div className="flex items-center gap-4" style={{ marginBottom: 16 }}>
        <span
          style={{
            fontSize: 48,
            fontWeight: 700,
            fontFamily: "var(--font-data)",
            color: scoreColor,
            lineHeight: 1,
            letterSpacing: -2,
          }}
        >
          {score.toFixed(1)}
        </span>
        <div>
          <StarVisual score={score} />
          <span
            style={{
              fontSize: 11,
              fontFamily: "var(--font-data)",
              color: "var(--text-muted)",
              marginTop: 4,
              display: "block",
            }}
          >
            {totalReviews} reviews this period
          </span>
        </div>
      </div>

      {trend.length > 1 && (
        <div style={{ height: 100, marginBottom: 16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="csatTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0E7169" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#0E7169" stopOpacity={0} />
                </linearGradient>
              </defs>
              <ReferenceLine
                y={4.0}
                stroke="var(--text-muted)"
                strokeDasharray="4 2"
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#0E7169"
                strokeWidth={2}
                fill="url(#csatTrendGrad)"
                dot={false}
                {...CHART_ANIMATION}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex flex-col" style={{ gap: 6 }}>
        {[5, 4, 3, 2, 1].map((rating) => {
          const item = distribution.find((d) => d.rating === rating);
          const count = item?.count ?? 0;
          const pct = totalReviews > 0 ? +((count / totalReviews) * 100).toFixed(0) : 0;
          const barWidth = (count / maxCount) * 100;

          return (
            <div key={rating} className="flex items-center gap-2" style={{ fontSize: 12 }}>
              <span
                style={{
                  fontFamily: "var(--font-data)",
                  color: "var(--text-secondary)",
                  width: 20,
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {rating}★
              </span>
              <div
                style={{
                  flex: 1,
                  height: 8,
                  background: "var(--surface-3)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${barWidth}%`,
                    background: STAR_COLORS[rating],
                    borderRadius: 4,
                    transition: "width 800ms ease",
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-data)",
                  color: "var(--text-muted)",
                  width: 32,
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {pct}%
              </span>
              <span
                style={{
                  fontFamily: "var(--font-data)",
                  color: "var(--text-secondary)",
                  width: 24,
                  textAlign: "right",
                  flexShrink: 0,
                  fontSize: 11,
                }}
              >
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
