"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { EmptyState } from "./EmptyState";
import { ShieldCheck } from "lucide-react";

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface SupportHealthPanelProps {
  data?: CategoryData[];
}

function DonutTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: { payload: CategoryData; value: number }[];
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";

  return (
    <div
      style={{
        background: "#1A2B42",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        padding: "8px 12px",
        fontFamily: "var(--font-data)",
        fontSize: 12,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: item.payload.color,
            flexShrink: 0,
          }}
        />
        <span style={{ color: "var(--text-secondary)" }}>{item.payload.name}</span>
      </div>
      <div style={{ marginTop: 4 }}>
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          {item.value} tickets
        </span>
        <span style={{ color: "var(--text-muted)", marginLeft: 6 }}>{pct}%</span>
      </div>
    </div>
  );
}

export function SupportHealthPanel({ data }: SupportHealthPanelProps) {
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
            Support Categories
          </h3>
        </div>
        <EmptyState icon={ShieldCheck} message="No support data available" />
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const hasHighVolume = data.some((d) => d.value > 10);

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
          Support Categories
        </h3>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
          style={{
            fontSize: 11,
            fontWeight: 600,
            fontFamily: "var(--font-data)",
            background: hasHighVolume ? "var(--warning-dim)" : "var(--success-dim)",
            color: hasHighVolume ? "var(--warning)" : "var(--success)",
          }}
        >
          {hasHighVolume ? "⚠ High Volume" : "● Healthy"}
        </span>
      </div>

      <div className="flex-1" style={{ padding: "16px 20px" }}>
        <div style={{ height: 200, position: "relative" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={2}
                cornerRadius={3}
                dataKey="value"
                isAnimationActive={true}
                animationDuration={1200}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip total={total} />} />
            </PieChart>
          </ResponsiveContainer>
          <div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          >
            <span
              style={{
                fontSize: 24,
                fontWeight: 700,
                fontFamily: "var(--font-data)",
                color: "var(--text-primary)",
                lineHeight: 1,
              }}
            >
              {total}
            </span>
            <span
              style={{
                fontSize: 10,
                fontFamily: "var(--font-data)",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginTop: 2,
              }}
            >
              open
            </span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2" style={{ marginTop: 12 }}>
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: item.color,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-data)",
                  color: "var(--text-secondary)",
                }}
              >
                {item.name}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-data)",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
