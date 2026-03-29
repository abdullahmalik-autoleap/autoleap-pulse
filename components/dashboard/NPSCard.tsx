"use client";

import { useState, useEffect } from "react";
import { useCountUp } from "@/lib/hooks/useCountUp";
import { ArrowUp, ArrowDown, ThumbsUp } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { formatPercent } from "@/lib/format";

interface NPSCardProps {
  score: number;
  promoters: number;
  passives: number;
  detractors: number;
  delta: number;
  isLoading?: boolean;
}

const BARS = [
  { key: "promoters", label: "Promoters", color: "var(--brand)" },
  { key: "passives", label: "Passives", color: "var(--info)" },
  { key: "detractors", label: "Detractors", color: "var(--danger)" },
] as const;

function getSentiment(score: number) {
  if (score >= 70) return { label: "Excellent", color: "var(--brand)" };
  if (score >= 50) return { label: "Good", color: "var(--info)" };
  if (score >= 30) return { label: "Fair", color: "var(--warning)" };
  return { label: "Needs Work", color: "var(--danger)" };
}

export function NPSCard({
  score,
  promoters,
  passives,
  detractors,
  delta,
  isLoading,
}: NPSCardProps) {
  const animatedScore = useCountUp(score, 1400);
  const isPositive = delta >= 0;
  const sentiment = getSentiment(score);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--pulse-border)",
          borderRadius: 14,
          padding: 24,
        }}
      >
        <div className="shimmer" style={{ width: 80, height: 48, borderRadius: 6 }} />
        <div className="shimmer" style={{ marginTop: 12, height: 6, borderRadius: 3 }} />
        <div className="shimmer" style={{ marginTop: 8, height: 6, borderRadius: 3, width: "70%" }} />
      </div>
    );
  }

  const total = promoters + passives + detractors;
  if (total === 0) {
    return (
      <div
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--pulse-border)",
          borderRadius: 14,
          padding: 24,
        }}
      >
        <EmptyState icon={ThumbsUp} message="No NPS responses yet" />
      </div>
    );
  }

  const values: Record<string, number> = { promoters, passives, detractors };

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--pulse-border)",
        borderRadius: 14,
        padding: 24,
      }}
    >
      <div className="flex gap-8" style={{ minHeight: 140 }}>
        <div className="flex flex-col justify-center shrink-0" style={{ minWidth: 120 }}>
          <span
            style={{
              fontSize: 64,
              fontWeight: 800,
              fontFamily: "var(--font-data)",
              color: "var(--brand)",
              lineHeight: 1,
              letterSpacing: -2,
            }}
          >
            {Math.round(animatedScore)}
          </span>
          <span
            style={{
              fontSize: 11,
              fontFamily: "var(--font-data)",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginTop: 6,
            }}
          >
            Net Promoter Score
          </span>
          <div className="flex items-center gap-2" style={{ marginTop: 8 }}>
            <span
              className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5"
              style={{
                fontSize: 11,
                fontWeight: 600,
                fontFamily: "var(--font-data)",
                background: isPositive ? "var(--success-dim)" : "var(--danger-dim)",
                color: isPositive ? "var(--success)" : "var(--danger)",
              }}
            >
              {isPositive ? (
                <ArrowUp style={{ width: 11, height: 11 }} />
              ) : (
                <ArrowDown style={{ width: 11, height: 11 }} />
              )}
              {Math.abs(delta).toFixed(1)}
            </span>
            <span
              style={{
                fontSize: 11,
                fontFamily: "var(--font-data)",
                color: "var(--text-muted)",
              }}
            >
              vs last month
            </span>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "var(--font-data)",
              color: sentiment.color,
              marginTop: 6,
            }}
          >
            {sentiment.label}
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-4">
          {BARS.map((bar) => {
            const pct = total > 0 ? (values[bar.key] / total) * 100 : 0;
            return (
              <div key={bar.key} className="flex items-center gap-3">
                <span
                  style={{
                    width: 70,
                    fontSize: 11,
                    fontFamily: "var(--font-data)",
                    color: "var(--text-muted)",
                    flexShrink: 0,
                  }}
                >
                  {bar.label}
                </span>
                <div
                  className="flex-1"
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
                      width: mounted ? `${pct}%` : "0%",
                      background: bar.color,
                      borderRadius: 3,
                      transition: "width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: "var(--font-data)",
                    color: bar.color,
                    width: 36,
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  {formatPercent(pct).replace("%", "")}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <div
          className="flex overflow-hidden"
          style={{ height: 8, borderRadius: 4, width: "100%" }}
        >
          <div
            style={{
              width: mounted && total > 0 ? `${(detractors / total) * 100}%` : "0%",
              background: "var(--danger)",
              transition: "width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />
          <div
            style={{
              width: mounted && total > 0 ? `${(passives / total) * 100}%` : "0%",
              background: "var(--info)",
              transition: "width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />
          <div
            style={{
              width: mounted && total > 0 ? `${(promoters / total) * 100}%` : "0%",
              background: "var(--brand)",
              transition: "width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />
        </div>
        <div
          className="flex justify-between"
          style={{
            marginTop: 6,
            fontSize: 10,
            fontFamily: "var(--font-data)",
            color: "var(--text-muted)",
          }}
        >
          <span>Detractors</span>
          <span>Passives</span>
          <span>Promoters</span>
        </div>
      </div>
    </div>
  );
}
