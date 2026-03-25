"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { TrendingDown } from "lucide-react";
import { CHART_GRID, CHART_AXIS_TICK, CHART_AXIS, CHART_ANIMATION, CHART_TOOLTIP_BG } from "@/lib/chartDefaults";

interface ChurnReason {
  reason: string;
  count: number;
  mrrImpact: number;
}

interface ChurnTrendPoint {
  month: string;
  churnRate: number;
}

interface ChurnAnalysisData {
  churnRate: number;
  churnRateDelta: number;
  churnMRR: number;
  avgTenureAtChurn: number;
  byReason: ChurnReason[];
  trend: ChurnTrendPoint[];
}

interface RecentChurnItem {
  shopName: string;
  plan: string;
  mrrImpact: number;
  reason: string;
  tenure: number;
  timeAgo: string;
}

interface ChurnProfile {
  avgTenureAtChurn: number;
  mostVulnerablePlan: string;
  highestRiskRegion: string;
  topChurnReason: string;
  topChurnReasonCount: number;
  mrrAtRisk: number;
}

interface ChurnAnalysisProps {
  churnAnalysis: ChurnAnalysisData | null;
  churnProfile: ChurnProfile | null;
  recentChurn: RecentChurnItem[];
  isLoading?: boolean;
}

const REASON_COLORS = ["#EF4444", "#F97316", "#EAB308", "#6366F1", "#8B5CF6", "#6B7280"];

const REASON_LABELS: Record<string, string> = {
  price: "Price",
  missing_feature: "Missing Feature",
  competitor: "Competitor",
  support: "Support",
  no_need: "No Need",
  unknown: "Unknown",
};

export function ChurnAnalysis({ churnAnalysis, churnProfile, recentChurn, isLoading }: ChurnAnalysisProps) {
  if (isLoading) return <ChartSkeleton height={400} />;

  if (!churnAnalysis || !churnProfile) {
    return (
      <ChartCard title="Churn Analysis">
        <EmptyState icon={TrendingDown} message="No churn data for this period" />
      </ChartCard>
    );
  }

  const totalChurnEvents = useMemo(
    () => churnAnalysis.byReason.reduce((sum, r) => sum + r.count, 0),
    [churnAnalysis.byReason],
  );

  const trendWithColor = useMemo(
    () =>
      churnAnalysis.trend.map((t) => ({
        ...t,
        above: t.churnRate > 2 ? t.churnRate : null,
        below: t.churnRate <= 2 ? t.churnRate : null,
      })),
    [churnAnalysis.trend],
  );

  return (
    <ChartCard
      title="Churn Analysis"
      subtitle={`${churnAnalysis.churnRate.toFixed(2)}% monthly churn rate`}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: "35% 35% 30%",
          gap: 20,
          minHeight: 280,
        }}
      >
        <div className="flex items-center gap-4">
          <div style={{ width: 160, height: 160, flexShrink: 0, position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={churnAnalysis.byReason}
                  dataKey="count"
                  nameKey="reason"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  strokeWidth={2}
                  stroke="var(--surface-1)"
                  {...CHART_ANIMATION}
                >
                  {churnAnalysis.byReason.map((_, idx) => (
                    <Cell key={idx} fill={REASON_COLORS[idx % REASON_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
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
                  fontSize: 20,
                  fontWeight: 700,
                  fontFamily: "var(--font-data)",
                  color: "var(--text-primary)",
                  lineHeight: 1,
                }}
              >
                {totalChurnEvents}
              </div>
              <div
                style={{
                  fontSize: 9,
                  fontFamily: "var(--font-data)",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginTop: 2,
                }}
              >
                churned
              </div>
            </div>
          </div>

          <div className="flex flex-col" style={{ gap: 6 }}>
            {churnAnalysis.byReason.map((r, idx) => (
              <div key={r.reason} className="flex items-center gap-2" style={{ fontSize: 11 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: REASON_COLORS[idx % REASON_COLORS.length],
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-data)",
                    color: "var(--text-secondary)",
                    minWidth: 80,
                  }}
                >
                  {REASON_LABELS[r.reason] ?? r.reason}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-data)",
                    color: "var(--text-muted)",
                  }}
                >
                  {r.count}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-data)",
                    color: "var(--danger)",
                    fontSize: 10,
                  }}
                >
                  ${(r.mrrImpact / 1000).toFixed(1)}k lost
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p
            style={{
              fontSize: 11,
              fontFamily: "var(--font-data)",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 8,
            }}
          >
            Churn Rate Trend
          </p>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendWithColor}>
                <CartesianGrid {...CHART_GRID} />
                <XAxis
                  dataKey="month"
                  tick={{ ...CHART_AXIS_TICK, fontSize: 10 }}
                  {...CHART_AXIS}
                  tickFormatter={(v: string) => v.split(" ")[0]}
                />
                <YAxis
                  tick={{ ...CHART_AXIS_TICK, fontSize: 10 }}
                  {...CHART_AXIS}
                  width={30}
                  tickFormatter={(v: number) => `${v}%`}
                  domain={[0, "auto"]}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
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
                        <p style={{ color: "var(--text-muted)", marginBottom: 4 }}>{label}</p>
                        <p style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                          {(payload[0].value as number).toFixed(2)}%
                        </p>
                      </div>
                    );
                  }}
                />
                <ReferenceArea
                  y1={0}
                  y2={2}
                  fill="rgba(14,113,105,0.06)"
                  strokeOpacity={0}
                />
                <ReferenceLine
                  y={2}
                  stroke="var(--text-muted)"
                  strokeDasharray="4 2"
                  label={{
                    value: "Target threshold",
                    position: "right",
                    fill: "var(--text-muted)",
                    fontSize: 9,
                    fontFamily: "var(--font-data)",
                  }}
                />
                <Line
                  dataKey="churnRate"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#EF4444", stroke: "var(--surface-1)", strokeWidth: 2 }}
                  {...CHART_ANIMATION}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <p
            style={{
              fontSize: 11,
              fontFamily: "var(--font-data)",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 12,
            }}
          >
            Churn Profile
          </p>

          <div className="flex flex-col" style={{ gap: 12 }}>
            <StatItem label="Avg tenure at churn" value={`${churnProfile.avgTenureAtChurn} months`} />
            <StatItem label="Most vulnerable plan" value={churnProfile.mostVulnerablePlan} />
            <StatItem label="Highest-risk region" value={churnProfile.highestRiskRegion} />
            <StatItem
              label="Top churn reason"
              value={`${REASON_LABELS[churnProfile.topChurnReason] ?? churnProfile.topChurnReason} (${churnProfile.topChurnReasonCount})`}
            />
            <StatItem label="MRR at risk" value={`$${(churnProfile.mrrAtRisk / 1000).toFixed(1)}k`} />
          </div>

          {recentChurn.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-data)",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                Recent Churns
              </p>
              <div className="flex flex-col" style={{ gap: 6 }}>
                {recentChurn.slice(0, 3).map((c, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between"
                    style={{
                      padding: "6px 10px",
                      background: "var(--surface-2)",
                      borderRadius: 6,
                      fontSize: 11,
                      fontFamily: "var(--font-data)",
                    }}
                  >
                    <div className="flex items-center gap-2" style={{ minWidth: 0, flex: 1 }}>
                      <span
                        style={{
                          color: "var(--text-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 100,
                        }}
                      >
                        {c.shopName}
                      </span>
                      <span
                        className="rounded-full px-1.5 py-0.5"
                        style={{
                          fontSize: 9,
                          background: "var(--surface-3)",
                          color: "var(--text-muted)",
                        }}
                      >
                        {c.plan}
                      </span>
                    </div>
                    <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                      <span style={{ color: "var(--danger)", fontWeight: 600 }}>
                        -${(c.mrrImpact / 1000).toFixed(1)}k
                      </span>
                      <span style={{ color: "var(--text-muted)", fontSize: 10 }}>
                        {c.timeAgo}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ChartCard>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontFamily: "var(--font-data)",
          color: "var(--text-muted)",
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          fontFamily: "var(--font-data)",
          color: "var(--text-primary)",
        }}
      >
        {value}
      </div>
    </div>
  );
}
