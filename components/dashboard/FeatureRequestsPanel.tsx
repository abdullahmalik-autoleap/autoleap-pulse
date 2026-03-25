"use client";

import { EmptyState } from "./EmptyState";
import { Lightbulb } from "lucide-react";
import { formatNumber } from "@/lib/format";

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  planned: { bg: "var(--info-dim)", text: "var(--info)" },
  in_progress: { bg: "var(--brand-dim)", text: "var(--brand)" },
  open: { bg: "var(--surface-3)", text: "var(--text-muted)" },
  done: { bg: "var(--success-dim)", text: "var(--success)" },
};

interface FeatureRequestsPanelProps {
  data?: { title: string; votes: number; status: string }[];
}

export function FeatureRequestsPanel({ data }: FeatureRequestsPanelProps) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--pulse-border)",
          borderRadius: 14,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="flex items-center justify-between shrink-0"
          style={{ padding: "16px 20px", borderBottom: "1px solid var(--pulse-border)" }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            Top Feature Requests
          </h3>
        </div>
        <EmptyState icon={Lightbulb} message="No feature requests yet" />
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.votes - a.votes);

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--pulse-border)",
        borderRadius: 14,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        className="flex items-center justify-between shrink-0"
        style={{ padding: "16px 20px", borderBottom: "1px solid var(--pulse-border)" }}
      >
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 15,
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          Top Feature Requests
        </h3>
        <span
          style={{
            fontSize: 12,
            fontFamily: "var(--font-data)",
            color: "var(--brand)",
          }}
        >
          View all
        </span>
      </div>

      <div className="flex-1">
        {sorted.map((item, i) => {
          const statusStyle = STATUS_STYLES[item.status] ?? STATUS_STYLES.open;
          return (
            <div
              key={item.title}
              className="flex items-center gap-3 transition-colors duration-150 kpi-fade-in"
              style={{
                padding: "10px 20px",
                borderBottom: i < sorted.length - 1 ? "1px solid var(--pulse-border)" : "none",
                animationDelay: `${i * 60}ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--surface-2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span
                className="shrink-0 rounded-md text-center"
                style={{
                  width: 36,
                  padding: "3px 0",
                  background: "var(--brand-dim)",
                  color: "var(--brand)",
                  fontFamily: "var(--font-data)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {formatNumber(item.votes)}
              </span>
              <span
                className="flex-1 truncate"
                style={{
                  fontSize: 13,
                  color: "var(--text-primary)",
                }}
              >
                {item.title}
              </span>
              <span
                className="shrink-0 rounded-full px-2 py-0.5"
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-data)",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  background: statusStyle.bg,
                  color: statusStyle.text,
                  whiteSpace: "nowrap",
                }}
              >
                {item.status.replace("_", " ")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
