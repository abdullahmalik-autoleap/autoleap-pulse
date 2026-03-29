"use client";

import { useCountUp } from "@/lib/hooks/useCountUp";
import { ArrowUp, ArrowDown, type LucideIcon } from "lucide-react";

const COLOR_MAP = {
  brand: "var(--brand)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  info: "var(--info)",
} as const;

type CardColor = keyof typeof COLOR_MAP;

interface KPICardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  delta?: number;
  color?: CardColor;
  icon?: LucideIcon;
  loading?: boolean;
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
      style={{ width, height, borderRadius: 6 }}
    />
  );
}

export function KPICard({
  label,
  value,
  prefix,
  suffix,
  delta,
  color = "brand",
  icon: Icon,
  loading = false,
}: KPICardProps) {
  const animated = useCountUp(loading ? 0 : value);
  const accentColor = COLOR_MAP[color];
  const isPositive = delta !== undefined && delta >= 0;

  return (
    <div
      className="group relative overflow-hidden transition-all duration-200"
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--pulse-border)",
        borderRadius: 12,
        padding: 20,
        height: 148,
        display: "flex",
        flexDirection: "column",
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
      {/* Accent top border */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
        }}
      />

      {/* Label row */}
      <div
        className="flex items-start gap-2"
        style={{ minHeight: 36 }}
      >
        {Icon && (
          <Icon
            style={{ width: 18, height: 18, color: "var(--text-muted)", flexShrink: 0, marginTop: 1 }}
          />
        )}
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontFamily: "var(--font-data)",
            color: "var(--text-muted)",
            lineHeight: 1.3,
          }}
        >
          {label}
        </span>
      </div>

      {/* Value */}
      <div style={{ marginTop: 8 }}>
        {loading ? (
          <Shimmer width={100} height={32} />
        ) : (
          <span
            style={{
              fontSize: 32,
              fontWeight: 600,
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

      {/* Delta badge */}
      <div style={{ marginTop: 10 }}>
        {loading ? (
          <Shimmer width={64} height={22} />
        ) : delta !== undefined ? (
          <span
            className="inline-flex items-center gap-1"
            style={{
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "var(--font-data)",
              background: isPositive ? "var(--success-dim)" : "var(--danger-dim)",
              color: isPositive ? "var(--success)" : "var(--danger)",
              padding: "3px 8px",
              borderRadius: 4,
            }}
          >
            {isPositive ? (
              <ArrowUp style={{ width: 12, height: 12 }} />
            ) : (
              <ArrowDown style={{ width: 12, height: 12 }} />
            )}
            {Math.abs(delta).toFixed(1)}%
          </span>
        ) : null}
      </div>
    </div>
  );
}
