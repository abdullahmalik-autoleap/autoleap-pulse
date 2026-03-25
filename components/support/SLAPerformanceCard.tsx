"use client";

import { ChartCard } from "@/components/dashboard/ChartCard";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";

interface SLAPriorityData {
  priority: string;
  slaTarget: string;
  resolutionTarget: string;
  responseSlaMetPct: number;
  resolutionSlaMetPct: number;
  breachCount: number;
  totalTickets: number;
}

interface SLAPerformanceData {
  breachCount: number;
  breachRate: number;
  overallSlaScore: number;
  grade: string;
  byPriority: SLAPriorityData[];
}

interface SLAPerformanceCardProps {
  data: SLAPerformanceData | null;
  isLoading?: boolean;
}

const PRIORITY_ORDER = ["urgent", "high", "normal", "low"];

const PRIORITY_LABELS: Record<string, string> = {
  urgent: "Urgent",
  high: "High",
  normal: "Normal",
  low: "Low",
};

const GRADE_COLORS: Record<string, string> = {
  A: "var(--brand)",
  B: "var(--brand)",
  C: "var(--warning)",
  D: "var(--danger)",
  F: "var(--danger)",
};

function getBarColor(pct: number): string {
  if (pct >= 90) return "var(--brand)";
  if (pct >= 75) return "var(--warning)";
  return "var(--danger)";
}

export function SLAPerformanceCard({ data, isLoading }: SLAPerformanceCardProps) {
  if (isLoading) return <ChartSkeleton height={360} />;
  if (!data) return null;

  const sortedPriorities = PRIORITY_ORDER
    .map((p) => data.byPriority.find((bp) => bp.priority === p))
    .filter(Boolean) as SLAPriorityData[];

  return (
    <ChartCard
      title="SLA Performance"
      subtitle="Response and resolution SLA compliance"
    >
      <div className="flex flex-col" style={{ gap: 16 }}>
        {sortedPriorities.map((prio) => (
          <div key={prio.priority}>
            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
              <div className="flex items-center gap-2">
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "var(--font-data)",
                    color: "var(--text-primary)",
                  }}
                >
                  {PRIORITY_LABELS[prio.priority] ?? prio.priority}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-data)",
                    color: "var(--text-muted)",
                  }}
                >
                  {prio.slaTarget} response · {prio.resolutionTarget} resolution
                </span>
              </div>
              {prio.breachCount > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: "var(--font-data)",
                    color: "var(--danger)",
                  }}
                >
                  {prio.breachCount} breaches
                </span>
              )}
              {prio.breachCount === 0 && (
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-data)",
                    color: "var(--text-muted)",
                  }}
                >
                  0 breaches
                </span>
              )}
            </div>

            {/* Dual progress bars */}
            <div className="flex flex-col" style={{ gap: 4 }}>
              <div className="flex items-center gap-2">
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-data)",
                    color: "var(--text-muted)",
                    width: 60,
                    flexShrink: 0,
                  }}
                >
                  Response
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 6,
                    background: "var(--surface-3)",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(prio.responseSlaMetPct, 100)}%`,
                      background: getBarColor(prio.responseSlaMetPct),
                      borderRadius: 3,
                      transition: "width 800ms ease",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: "var(--font-data)",
                    color: getBarColor(prio.responseSlaMetPct),
                    width: 40,
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  {prio.responseSlaMetPct}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-data)",
                    color: "var(--text-muted)",
                    width: 60,
                    flexShrink: 0,
                  }}
                >
                  Resolution
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 6,
                    background: "var(--surface-3)",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(prio.resolutionSlaMetPct, 100)}%`,
                      background: getBarColor(prio.resolutionSlaMetPct),
                      borderRadius: 3,
                      transition: "width 800ms ease",
                      opacity: 0.6,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: "var(--font-data)",
                    color: getBarColor(prio.resolutionSlaMetPct),
                    width: 40,
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  {prio.resolutionSlaMetPct}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overall Score + Grade */}
      <div
        className="flex items-center justify-between"
        style={{
          marginTop: 20,
          padding: "12px 16px",
          background: "var(--surface-2)",
          borderRadius: 8,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              fontFamily: "var(--font-data)",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 4,
            }}
          >
            Overall SLA Score
          </div>
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              fontFamily: "var(--font-data)",
              color: "var(--text-primary)",
              lineHeight: 1,
            }}
          >
            {data.overallSlaScore}%
          </span>
        </div>
        <span
          style={{
            fontSize: 36,
            fontWeight: 800,
            fontFamily: "var(--font-data)",
            color: GRADE_COLORS[data.grade] ?? "var(--text-muted)",
            lineHeight: 1,
          }}
        >
          {data.grade}
        </span>
      </div>
    </ChartCard>
  );
}
