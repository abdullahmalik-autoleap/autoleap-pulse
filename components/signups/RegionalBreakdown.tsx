"use client";

import { useState } from "react";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";

interface RegionData {
  region: string;
  count: number;
  percentage: number;
  conversionRate: number;
  topState: string;
}

interface RegionalBreakdownProps {
  data: RegionData[];
  isLoading?: boolean;
}

function rateColor(rate: number): string {
  if (rate > 35) return "var(--brand)";
  if (rate >= 25) return "var(--warning)";
  return "var(--danger)";
}

const REGION_MAP_DATA: Record<
  string,
  { x: number; y: number; w: number; h: number }
> = {
  West: { x: 20, y: 60, w: 120, h: 160 },
  Southwest: { x: 140, y: 160, w: 100, h: 80 },
  Midwest: { x: 200, y: 40, w: 120, h: 120 },
  Southeast: { x: 300, y: 140, w: 120, h: 100 },
  Northeast: { x: 340, y: 30, w: 100, h: 100 },
  Canada: { x: 100, y: 0, w: 260, h: 40 },
};

export function RegionalBreakdown({ data, isLoading }: RegionalBreakdownProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  if (isLoading) return <ChartSkeleton height={320} />;

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <ChartCard title="Regional Breakdown">
      <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6">
        {/* LEFT: Summary table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Region", "Signups", "% of Total", "Conv. Rate", "Top State"].map(
                  (h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr
                  key={row.region}
                  style={{
                    background:
                      hovered === row.region
                        ? "var(--surface-3)"
                        : i % 2 === 0
                          ? "var(--surface-1)"
                          : "var(--surface-2)",
                    transition: "background 0.15s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={() => setHovered(row.region)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <td style={tdStyle}>{row.region}</td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: "var(--text-primary)" }}>
                    {row.count}
                  </td>
                  <td style={tdStyle}>
                    <div className="flex items-center gap-2">
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
                            width: `${row.percentage}%`,
                            height: "100%",
                            borderRadius: 3,
                            background: "var(--brand)",
                            transition: "width 0.6s ease",
                          }}
                        />
                      </div>
                      <span>{row.percentage}%</span>
                    </div>
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      color: rateColor(row.conversionRate),
                      fontWeight: 600,
                    }}
                  >
                    {row.conversionRate}%
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {row.topState}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RIGHT: Simplified SVG region map */}
        <div style={{ position: "relative" }}>
          <svg
            viewBox="0 0 460 280"
            style={{ width: "100%", height: "auto" }}
          >
            {data.map((d) => {
              const shape = REGION_MAP_DATA[d.region];
              if (!shape) return null;
              const opacity = 0.25 + (d.count / maxCount) * 0.65;
              const isHovered = hovered === d.region;
              return (
                <g
                  key={d.region}
                  onMouseEnter={() => setHovered(d.region)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer" }}
                >
                  <rect
                    x={shape.x}
                    y={shape.y}
                    width={shape.w}
                    height={shape.h}
                    rx={6}
                    fill="#0E7169"
                    fillOpacity={opacity}
                    stroke={isHovered ? "#0E7169" : "rgba(255,255,255,0.1)"}
                    strokeWidth={isHovered ? 2 : 1}
                    style={{ transition: "all 0.2s ease" }}
                  />
                  <text
                    x={shape.x + shape.w / 2}
                    y={shape.y + shape.h / 2 - 6}
                    textAnchor="middle"
                    fill="var(--text-primary)"
                    fontSize={11}
                    fontFamily="var(--font-data)"
                    fontWeight={600}
                  >
                    {d.region}
                  </text>
                  <text
                    x={shape.x + shape.w / 2}
                    y={shape.y + shape.h / 2 + 10}
                    textAnchor="middle"
                    fill="var(--text-secondary)"
                    fontSize={10}
                    fontFamily="var(--font-data)"
                  >
                    {d.count} signups
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Tooltip */}
          {hovered && (() => {
            const d = data.find((r) => r.region === hovered);
            const shape = REGION_MAP_DATA[hovered];
            if (!d || !shape) return null;
            return (
              <div
                style={{
                  position: "absolute",
                  left: `${((shape.x + shape.w / 2) / 460) * 100}%`,
                  top: `${((shape.y) / 280) * 100 - 5}%`,
                  transform: "translate(-50%, -100%)",
                  background: "#1A2B42",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontFamily: "var(--font-data)",
                  fontSize: 11,
                  pointerEvents: "none",
                  zIndex: 10,
                  whiteSpace: "nowrap",
                }}
              >
                <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  {d.region}
                </div>
                <div style={{ color: "var(--text-secondary)", marginTop: 2 }}>
                  {d.count} signups &middot; {d.conversionRate}% conv.
                </div>
              </div>
            );
          })()}
        </div>
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
