"use client";

import { ChartCard } from "@/components/dashboard/ChartCard";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";

interface CohortRow {
  week: string;
  signups: number;
  converted: number;
  convertedPct: number;
  stillInTrial: number;
  churned: number;
}

interface CohortTableProps {
  data: CohortRow[];
  isLoading?: boolean;
}

function ratePill(rate: number) {
  let bg: string;
  let color: string;
  if (rate > 35) {
    bg = "var(--brand-dim)";
    color = "var(--brand)";
  } else if (rate >= 25) {
    bg = "var(--warning-dim)";
    color = "var(--warning)";
  } else {
    bg = "var(--danger-dim)";
    color = "var(--danger)";
  }
  return { bg, color };
}

export function CohortTable({ data, isLoading }: CohortTableProps) {
  if (isLoading) return <ChartSkeleton height={320} />;

  const rows = data.slice(0, 8);

  const bestIdx = rows.reduce(
    (best, row, i) =>
      row.convertedPct > (rows[best]?.convertedPct ?? 0) ? i : best,
    0,
  );

  const avgSignups = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.signups, 0) / rows.length)
    : 0;
  const avgConverted = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.converted, 0) / rows.length)
    : 0;
  const avgPct = rows.length
    ? +(rows.reduce((s, r) => s + r.convertedPct, 0) / rows.length).toFixed(1)
    : 0;
  const avgTrial = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.stillInTrial, 0) / rows.length)
    : 0;
  const avgChurned = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.churned, 0) / rows.length)
    : 0;

  const headers = [
    "Week of",
    "Signups",
    "Converted",
    "Conv. Rate",
    "Still in Trial",
    "Churned",
    "",
  ];

  return (
    <ChartCard
      title="Weekly Cohort Conversion"
      subtitle="Signups → Paid conversion by signup week"
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h || "bar"} style={thStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isBest = i === bestIdx;
              const pill = ratePill(row.convertedPct);
              return (
                <tr
                  key={row.week}
                  style={{
                    background:
                      i % 2 === 1
                        ? "var(--chart-cursor)"
                        : "transparent",
                    borderLeft: isBest
                      ? "3px solid var(--brand)"
                      : "3px solid transparent",
                  }}
                >
                  <td style={tdStyle}>{row.week}</td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: "var(--text-primary)" }}>
                    {row.signups}
                  </td>
                  <td style={{ ...tdStyle, color: "var(--text-primary)" }}>
                    {row.converted}
                  </td>
                  <td style={tdStyle}>
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5"
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: "var(--font-data)",
                        background: pill.bg,
                        color: pill.color,
                      }}
                    >
                      {row.convertedPct}%
                    </span>
                  </td>
                  <td style={tdStyle}>{row.stillInTrial}</td>
                  <td style={{ ...tdStyle, color: "var(--text-muted)" }}>
                    {row.churned}
                  </td>
                  <td style={{ ...tdStyle, width: 100 }}>
                    <div
                      style={{
                        width: 80,
                        height: 6,
                        borderRadius: 3,
                        background: "var(--surface-3)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(row.convertedPct, 100)}%`,
                          height: "100%",
                          borderRadius: 3,
                          background: "var(--brand)",
                          transition: "width 0.6s ease",
                        }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Average footer row */}
            <tr
              style={{
                borderTop: "1px solid var(--pulse-border)",
              }}
            >
              <td
                style={{
                  ...tdStyle,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                Average
              </td>
              <td
                style={{
                  ...tdStyle,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                {avgSignups}
              </td>
              <td
                style={{
                  ...tdStyle,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                {avgConverted}
              </td>
              <td style={tdStyle}>
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "var(--font-data)",
                    background: ratePill(avgPct).bg,
                    color: ratePill(avgPct).color,
                  }}
                >
                  {avgPct}%
                </span>
              </td>
              <td
                style={{
                  ...tdStyle,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                {avgTrial}
              </td>
              <td
                style={{
                  ...tdStyle,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                }}
              >
                {avgChurned}
              </td>
              <td style={{ ...tdStyle, width: 100 }}>
                <div
                  style={{
                    width: 80,
                    height: 6,
                    borderRadius: 3,
                    background: "var(--surface-3)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(avgPct, 100)}%`,
                      height: "100%",
                      borderRadius: 3,
                      background: "var(--brand)",
                      opacity: 0.6,
                    }}
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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
