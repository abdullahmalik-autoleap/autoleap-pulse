"use client";

import { useState, useEffect } from "react";
import { RotateCw, Search, type LucideIcon } from "lucide-react";
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

const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

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

  function openCommandCentre() {
    window.dispatchEvent(new Event("open-command-centre"));
  }

  return (
    <header
      className="flex items-center justify-between px-6 shrink-0 z-10"
      style={{
        height: 56,
        background: "var(--surface-1)",
        borderBottom: "1px solid var(--pulse-border)",
      }}
    >
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
                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>/</span>
                )}
                <span
                  style={{
                    fontSize: 12,
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

      <div className="flex items-center" style={{ gap: 12 }}>
        <div
          className="relative flex items-center gap-1 rounded-lg p-0.5"
          style={{ background: "var(--surface-2)" }}
        >
          {ranges.map((r) => (
            <button
              key={r.key}
              onClick={() => onRangeChange?.(r.key)}
              className="font-medium transition-all duration-200"
              style={{
                height: 30,
                padding: "0 12px",
                borderRadius: 6,
                fontSize: 12,
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

        <button
          onClick={openCommandCentre}
          className="relative flex items-center justify-center transition-all duration-200"
          style={{
            width: 36,
            height: 36,
            background: "var(--surface-2)",
            border: "1px solid var(--pulse-border)",
            borderRadius: 8,
            color: "var(--text-muted)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-3)";
            e.currentTarget.style.borderColor = "var(--border-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--surface-2)";
            e.currentTarget.style.borderColor = "var(--pulse-border)";
          }}
          title="Command Centre"
        >
          <Search style={{ width: 15, height: 15 }} />
          <span
            style={{
              position: "absolute",
              bottom: 2,
              right: 2,
              fontSize: 8,
              fontFamily: "var(--font-data)",
              color: "var(--text-muted)",
              lineHeight: 1,
            }}
          >
            {isMac ? "⌘K" : "^K"}
          </span>
        </button>

        <button
          onClick={onRefresh}
          className="flex items-center justify-center transition-all duration-200"
          style={{
            width: 36,
            height: 36,
            background: "var(--surface-2)",
            border: "1px solid var(--pulse-border)",
            borderRadius: 8,
            color: "var(--text-muted)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-3)";
            e.currentTarget.style.borderColor = "var(--border-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--surface-2)";
            e.currentTarget.style.borderColor = "var(--pulse-border)";
          }}
          title={timeAgo ? `Last updated: ${timeAgo}` : "Refresh data (R)"}
        >
          <RotateCw
            className={isRefreshing ? "refresh-spin" : ""}
            style={{ width: 15, height: 15 }}
          />
        </button>

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
      </div>
    </header>
  );
}
