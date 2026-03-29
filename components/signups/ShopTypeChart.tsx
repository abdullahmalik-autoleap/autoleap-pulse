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
import { Store } from "lucide-react";
import { CHART_AXIS, CHART_ANIMATION } from "@/lib/chartDefaults";

interface ByShopType {
  type: string;
  count: number;
  percentage: number;
}

interface ShopTypeChartProps {
  data: ByShopType[];
  isLoading?: boolean;
}

const TYPE_EMOJIS: Record<string, string> = {
  general: "\u{1F527}",
  tire: "\u{1F6DE}",
  quicklube: "\u{1F6E2}\u{FE0F}",
  specialty: "\u{2699}\u{FE0F}",
  mobile: "\u{1F690}",
  fleet: "\u{1F69B}",
};

const TYPE_LABELS: Record<string, string> = {
  general: "General Repair",
  tire: "Tire Shop",
  quicklube: "Quick Lube",
  specialty: "Specialty",
  mobile: "Mobile",
  fleet: "Fleet",
};

export function ShopTypeChart({ data, isLoading }: ShopTypeChartProps) {
  if (isLoading) return <ChartSkeleton height={280} />;

  if (!data || data.length === 0) {
    return (
      <ChartCard title="By Shop Type">
        <EmptyState icon={Store} message="No shop type data for this period" />
      </ChartCard>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: `${TYPE_EMOJIS[d.type] ?? ""} ${TYPE_LABELS[d.type] ?? d.type}`,
  }));

  return (
    <ChartCard title="By Shop Type">
      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 10, right: 50 }}
          >
            <defs>
              <linearGradient id="shopTypeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.6} />
                <stop offset="100%" stopColor="var(--brand)" stopOpacity={1} />
              </linearGradient>
            </defs>
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
              width={120}
            />
            <Tooltip
              content={
                <CustomTooltip colorMap={{ count: "var(--brand)" }} />
              }
              cursor={{ fill: "var(--chart-cursor)" }}
            />
            <Bar
              dataKey="count"
              name="Signups"
              fill="url(#shopTypeGrad)"
              radius={[0, 3, 3, 0]}
              barSize={18}
              {...CHART_ANIMATION}
              label={({ x, y, width, index }: { x?: string | number; y?: string | number; width?: string | number; index?: number }) => {
                const nx = Number(x ?? 0);
                const ny = Number(y ?? 0);
                const nw = Number(width ?? 0);
                const pct = chartData[index ?? 0]?.percentage ?? 0;
                return (
                  <text
                    x={nx + nw + 6}
                    y={ny + 12}
                    fill="var(--text-secondary)"
                    fontSize={10}
                    fontFamily="var(--font-data)"
                    fontWeight={600}
                  >
                    {pct}%
                  </text>
                );
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
