"use client";

import { useCountUp } from "@/lib/hooks/useCountUp";
import { ArrowUp, ArrowDown, type LucideIcon } from "lucide-react";
import {
  ResponsiveContainer,
  Area,
} from "recharts";
import { LazyAreaChart as AreaChart } from "@/components/charts/lazy";

const COLOR_MAP = {
  brand: { solid: "var(--brand)", dim: "var(--brand-dim)", hex: "var(--brand)" },
  success: { solid: "var(--success)", dim: "var(--success-dim)", hex: "var(--brand)" },
  warning: { solid: "var(--warning)", dim: "var(--warning-dim)", hex: "var(--warning)" },
  danger: { solid: "var(--danger)", dim: "var(--danger-dim)", hex: "var(--danger)" },
  info: { solid: "var(--info)", dim: "var(--info-dim)", hex: "var(--info)" },
} as const;

type CardColor = keyof typeof COLOR_MAP;

interface KPICardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  delta?: number;
  deltaLabel?: string;
  color?: CardColor;
  icon?: LucideIcon;
  loading?: boolean;
  sparklineData?: number[];
}

function formatValue(n: number, suffix?: string) {
  if (suffix === "%" || suffix === "K") return n.toFixed(1);
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (Number.isInteger(n)) return n.toString();
  return n.toFixed(1);
}

function Shimmer({ width = "100%", height = 20 }: { width?: string | number; height?: number }) {
  return (
    <div
      className="shimmer"
      style={{
        width,
        height,
        borderRadius: 6,
      }}
    />
  );
}

export function KPICard({
  label,
  value,
  prefix,
  suffix,
  delta,
  deltaLabel,
  color = "brand",
  icon: Icon,
  loading = false,
  sparklineData,
}: KPICardProps) {
  const animated = useCountUp(loading ? 0 : value);
  const colors = COLOR_MAP[color];
  const isPositive = delta !== undefined && delta >= 0;
  const sparkData = sparklineData?.map((v, i) => ({ i, v }));

  return (
    <div
      className="group relative overflow-hidden transition-all duration-200"
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--pulse-border)",
        borderRadius: 12,
        padding: 20,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-hover)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--pulse-border)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${colors.hex}, transparent)`,
        }}
      />

      <div className="flex items-center gap-2">
        {Icon && (
          <Icon
            style={{ width: 16, height: 16, color: "var(--text-muted)", flexShrink: 0 }}
          />
        )}
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontFamily: "var(--font-data)",
            color: "var(--text-secondary)",
          }}
        >
          {label}
        </span>
      </div>

      <div style={{ marginTop: 10 }}>
        {loading ? (
          <Shimmer width={100} height={32} />
        ) : (
          <span
            style={{
              fontSize: 32,
              fontWeight: 700,
              fontFamily: "var(--font-data)",
              letterSpacing: -1,
              color: "var(--text-primary)",
              lineHeight: 1,
            }}
          >
            {prefix}
            {formatValue(animated, suffix)}
            {suffix && (
              <span style={{ fontSize: 18, fontWeight: 500, marginLeft: 1 }}>
                {suffix}
              </span>
            )}
          </span>
        )}
      </div>

      {delta !== undefined && (
        <div className="flex items-center gap-2" style={{ marginTop: 10 }}>
          {loading ? (
            <Shimmer width={120} height={18} />
          ) : (
            <>
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
                {Math.abs(delta).toFixed(1)}%
              </span>
              {deltaLabel && (
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-data)",
                  }}
                >
                  {deltaLabel}
                </span>
              )}
            </>
          )}
        </div>
      )}

      <div style={{ marginTop: 12, height: 40 }}>
        {sparkData && sparkData.length > 1 && !loading && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id={`spark-${label.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.hex} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={colors.hex} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={colors.hex}
                strokeWidth={1.5}
                fill={`url(#spark-${label.replace(/\s/g, "")})`}
                dot={false}
                isAnimationActive={true}
                animationDuration={200}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
