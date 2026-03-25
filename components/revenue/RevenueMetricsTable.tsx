"use client";

import { useState, useMemo, useCallback } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Download } from "lucide-react";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";

interface MonthlyTableRow {
  month: string;
  mrr: number;
  momDelta: number;
  arr: number;
  newMRR: number;
  expansion: number;
  contraction: number;
  churn: number;
  netNew: number;
  arpu: number;
  shops: number;
}

interface RevenueMetricsTableProps {
  data: MonthlyTableRow[];
  isLoading?: boolean;
}

type SortKey = keyof MonthlyTableRow;
type SortDir = "asc" | "desc";

interface Column {
  key: SortKey;
  label: string;
  format: (v: number, row: MonthlyTableRow) => string;
  colorFn?: (v: number) => string | undefined;
  align?: "left" | "right";
}

const COLUMNS: Column[] = [
  {
    key: "month",
    label: "Month",
    format: (_, row) => row.month,
    align: "left",
  },
  {
    key: "mrr",
    label: "MRR",
    format: (v) => `$${(v / 1000).toFixed(1)}k`,
  },
  {
    key: "momDelta",
    label: "MoM Δ",
    format: (v) => `${v >= 0 ? "▲" : "▼"} ${Math.abs(v).toFixed(1)}%`,
    colorFn: (v) => (v >= 0 ? "var(--success)" : "var(--danger)"),
  },
  {
    key: "arr",
    label: "ARR",
    format: (v) => `$${(v / 1000000).toFixed(2)}m`,
  },
  {
    key: "newMRR",
    label: "New MRR",
    format: (v) => `+$${(v / 1000).toFixed(1)}k`,
    colorFn: () => "var(--success)",
  },
  {
    key: "expansion",
    label: "Expansion",
    format: (v) => `+$${(v / 1000).toFixed(1)}k`,
    colorFn: () => "var(--success)",
  },
  {
    key: "contraction",
    label: "Contraction",
    format: (v) => `-$${(v / 1000).toFixed(1)}k`,
    colorFn: () => "var(--danger)",
  },
  {
    key: "churn",
    label: "Churn",
    format: (v) => `-$${(v / 1000).toFixed(1)}k`,
    colorFn: () => "var(--danger)",
  },
  {
    key: "netNew",
    label: "Net New",
    format: (v) => `${v >= 0 ? "+" : ""}$${(v / 1000).toFixed(1)}k`,
    colorFn: (v) => (v >= 0 ? "var(--success)" : "var(--danger)"),
  },
  {
    key: "arpu",
    label: "ARPU",
    format: (v) => `$${v.toFixed(0)}`,
  },
  {
    key: "shops",
    label: "Shops",
    format: (v) => v.toLocaleString("en-US"),
  },
];

function getCurrentMonth(): string {
  const now = new Date();
  return now.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function RevenueMetricsTable({ data, isLoading }: RevenueMetricsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("month");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const currentMonth = useMemo(() => getCurrentMonth(), []);

  const bestGrowthMonth = useMemo(() => {
    if (data.length === 0) return "";
    let best = data[0];
    for (const row of data) {
      if (row.momDelta > best.momDelta) best = row;
    }
    return best.month;
  }, [data]);

  const sorted = useMemo(() => {
    const rows = [...data];
    rows.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
    return rows;
  }, [data, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const exportCSV = useCallback(() => {
    const headers = COLUMNS.map((c) => c.label).join(",");
    const rows = data.map((row) =>
      COLUMNS.map((col) => {
        const val = row[col.key];
        if (typeof val === "string") return `"${val}"`;
        return val;
      }).join(","),
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "revenue-metrics.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  if (isLoading) return <ChartSkeleton height={400} />;

  return (
    <ChartCard
      title="Monthly Revenue Breakdown"
      subtitle="Last 12 months"
      headerRight={
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors"
          style={{
            fontSize: 12,
            fontFamily: "var(--font-data)",
            fontWeight: 500,
            color: "var(--text-secondary)",
            background: "var(--surface-2)",
            border: "1px solid var(--pulse-border)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-3)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--surface-2)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          <Download style={{ width: 13, height: 13 }} />
          Export CSV
        </button>
      }
    >
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
            minWidth: 900,
            borderCollapse: "collapse",
            fontFamily: "var(--font-data)",
            fontSize: 12,
          }}
        >
          <thead>
            <tr>
              {COLUMNS.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    style={{
                      position: col.key === "month" ? "sticky" : undefined,
                      left: col.key === "month" ? 0 : undefined,
                      zIndex: col.key === "month" ? 2 : 1,
                      background: "var(--surface-2)",
                      padding: "10px 12px",
                      textAlign: col.align ?? "right",
                      fontWeight: 600,
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: isSorted ? "var(--brand)" : "var(--text-muted)",
                      cursor: "pointer",
                      userSelect: "none",
                      whiteSpace: "nowrap",
                      borderBottom: "1px solid var(--pulse-border)",
                    }}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {isSorted ? (
                        sortDir === "asc" ? (
                          <ArrowUp style={{ width: 12, height: 12 }} />
                        ) : (
                          <ArrowDown style={{ width: 12, height: 12 }} />
                        )
                      ) : (
                        <ArrowUpDown style={{ width: 11, height: 11, opacity: 0.3 }} />
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const isCurrent = row.month === currentMonth;
              const isBestGrowth = row.month === bestGrowthMonth;
              const isNegativeNet = row.netNew < 0;

              let rowBg = "transparent";
              if (isCurrent) rowBg = "var(--brand-dim)";
              else if (isNegativeNet) rowBg = "rgba(239,68,68,0.04)";

              let borderLeft = "2px solid transparent";
              if (isCurrent) borderLeft = "2px solid var(--brand)";
              else if (isBestGrowth) borderLeft = "2px solid #F59E0B";

              return (
                <tr
                  key={row.month}
                  style={{ background: rowBg }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) e.currentTarget.style.background = "var(--surface-3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = rowBg;
                  }}
                >
                  {COLUMNS.map((col) => {
                    const val = row[col.key];
                    const numVal = typeof val === "number" ? val : 0;
                    const formatted = col.format(numVal, row);
                    const color = col.colorFn?.(numVal);

                    return (
                      <td
                        key={col.key}
                        style={{
                          position: col.key === "month" ? "sticky" : undefined,
                          left: col.key === "month" ? 0 : undefined,
                          zIndex: col.key === "month" ? 1 : undefined,
                          background: col.key === "month" ? (isCurrent ? "var(--brand-dim)" : "var(--surface-1)") : undefined,
                          borderLeft: col.key === "month" ? borderLeft : undefined,
                          padding: "10px 12px",
                          textAlign: col.align ?? "right",
                          fontWeight: isCurrent ? 600 : col.key === "month" ? 500 : 400,
                          color: color ?? "var(--text-primary)",
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid var(--pulse-border)",
                        }}
                      >
                        {formatted}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}
