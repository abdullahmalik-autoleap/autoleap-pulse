"use client";

import { useState, useEffect } from "react";
import { RotateCw } from "lucide-react";
import type { DateRange } from "@/types/dashboard";

const DEFAULT_RANGES: { key: DateRange; label: string }[] = [
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "90d", label: "90D" },
];

interface HeaderProps {
  title?: string;
  breadcrumb?: string;
  ranges?: { key: DateRange; label: string }[];
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
    const id = setInterval(() => setSeconds(calc()), 1000);
    return () => clearInterval(id);
  }, [date]);

  if (!date) return null;
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.floor(seconds / 60)}m ago`;
}

export function Header({
  title = "Overview",
  breadcrumb = "Dashboard",
  ranges = DEFAULT_RANGES,
  range = "30d",
  onRangeChange,
  onRefresh,
  isRefreshing = false,
  lastUpdated,
}: HeaderProps) {
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
      <div className="flex items-center gap-2">
        <h1
          className="text-[15px] font-semibold"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-display)",
          }}
        >
          {title}
        </h1>
        <span className="text-[13px]" style={{ color: "var(--text-muted)" }}>
          /
        </span>
        <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
          {breadcrumb}
        </span>
      </div>

      <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: "var(--surface-2)" }}>
        {ranges.map((r) => (
          <button
            key={r.key}
            onClick={() => onRangeChange?.(r.key)}
            className="px-3 py-1 rounded-md text-[12px] font-medium transition-all duration-200"
            style={{
              fontFamily: "var(--font-data)",
              background: range === r.key ? "var(--brand)" : "transparent",
              color: range === r.key ? "var(--active-nav-text)" : "var(--text-secondary)",
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
      </div>

      <div className="flex items-center gap-4">
        {timeAgo && (
          <span
            className="text-[11px]"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-data)",
            }}
          >
            Updated {timeAgo}
          </span>
        )}

        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style={{ background: "var(--live-color)" }}
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ background: "var(--live-color)" }}
            />
          </span>
          <span
            className="text-[12px] font-medium"
            style={{ color: "var(--live-color)", fontFamily: "var(--font-data)" }}
          >
            Live
          </span>
        </div>

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
          title="Refresh data"
        >
          <RotateCw
            className={isRefreshing ? "refresh-spin" : ""}
            style={{ width: 15, height: 15 }}
          />
        </button>

        <div
          className="flex items-center justify-center rounded-full text-[10px] font-bold"
          style={{
            width: 28,
            height: 28,
            background: "var(--brand)",
            color: "var(--active-nav-text)",
          }}
        >
          A
        </div>
      </div>
    </header>
  );
}
