"use client";

import { useState, useEffect } from "react";
import { RotateCw, type LucideIcon } from "lucide-react";
import type { DateRange } from "@/types/dashboard";

const DEFAULT_RANGES: { key: DateRange; label: string; shortcut?: string }[] = [
  { key: "7d", label: "7D", shortcut: "7" },
  { key: "30d", label: "30D", shortcut: "3" },
  { key: "90d", label: "90D", shortcut: "9" },
];

interface PageHeaderProps {
  title: string;
  icon: LucideIcon;
  breadcrumbs: string[];
  ranges?: { key: DateRange; label: string; shortcut?: string }[];
  range?: DateRange;
  onRangeChange?: (range: DateRange) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastUpdated?: Date;
}

function useTimeAgo(date: Date | undefined) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!date) return;
    const calc = () => Math.floor((Date.now() - date.getTime()) / 1000);
    setSeconds(calc());
    const id = setInterval(() => setSeconds(calc()), 1000);
    return () => clearInterval(id);
  }, [date]);

  if (!date) return null;
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.floor(seconds / 60)}m ago`;
}

export function PageHeader({
  title,
  icon: Icon,
  breadcrumbs,
  ranges = DEFAULT_RANGES,
  range = "30d",
  onRangeChange,
  onRefresh,
  isRefreshing = false,
  lastUpdated,
}: PageHeaderProps) {
  const timeAgo = useTimeAgo(lastUpdated);

  return (
    <header
      className="flex items-center justify-between px-6 shrink-0 z-10"
      style={{
        height: 56,
        background: "var(--surface-1)",
        borderBottom: "1px solid var(--pulse-border)",
      }}
    >
      {/* Left: Icon + Title + Breadcrumb */}
      <div className="flex items-center gap-2.5">
        <Icon
          style={{
            width: 20,
            height: 20,
            color: "var(--brand)",
            flexShrink: 0,
          }}
        />
        <div className="flex flex-col">
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--text-primary)",
              fontFamily: "var(--font-display)",
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
          <nav className="flex items-center gap-1" style={{ marginTop: 1 }}>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                    }}
                  >
                    /
                  </span>
                )}
                <span
                  style={{
                    fontSize: 11,
                    color: i === breadcrumbs.length - 1 ? "var(--text-secondary)" : "var(--text-muted)",
                    fontFamily: "var(--font-data)",
                  }}
                >
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        </div>
      </div>

      {/* Right: Date range selector + refresh + last updated */}
      <div className="flex items-center gap-3">
        {/* Date range selector */}
        <div
          className="relative flex items-center gap-1 rounded-lg p-0.5"
          style={{ background: "var(--surface-2)" }}
        >
          {ranges.map((r) => (
            <button
              key={r.key}
              onClick={() => onRangeChange?.(r.key)}
              className="px-3 py-1 rounded-md text-[12px] font-medium transition-all duration-200"
              style={{
                fontFamily: "var(--font-data)",
                background: range === r.key ? "var(--brand)" : "transparent",
                color: range === r.key ? "#fff" : "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                if (range !== r.key)
                  e.currentTarget.style.background = "var(--surface-3)";
              }}
              onMouseLeave={(e) => {
                if (range !== r.key)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              {r.label}
            </button>
          ))}
          {/* Keyboard shortcut hint */}
          <div
            className="flex items-center gap-1 ml-1"
            style={{
              padding: "2px 6px",
              borderRadius: 4,
              background: "var(--surface-3)",
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontFamily: "var(--font-data)",
                color: "var(--text-muted)",
              }}
            >
              ? for shortcuts
            </span>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          className="p-1.5 rounded-lg transition-all duration-200"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-2)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
          title="Refresh data (R)"
        >
          <RotateCw
            className={isRefreshing ? "refresh-spin" : ""}
            style={{ width: 15, height: 15 }}
          />
        </button>

        {/* Last updated */}
        {timeAgo && (
          <span
            className="text-[11px]"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-data)",
            }}
          >
            {timeAgo}
          </span>
        )}

        {/* Live indicator */}
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style={{ background: "#22c55e" }}
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ background: "#22c55e" }}
            />
          </span>
          <span
            className="text-[12px] font-medium"
            style={{ color: "#22c55e", fontFamily: "var(--font-data)" }}
          >
            Live
          </span>
        </div>
      </div>
    </header>
  );
}
