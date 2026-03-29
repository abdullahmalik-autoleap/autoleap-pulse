"use client";

import { InboxIcon, type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  message?: string;
  subtext?: string;
  onRefresh?: () => void;
}

export function EmptyState({
  icon: Icon = InboxIcon,
  message = "No data for this period",
  subtext = "Try a different date range",
  onRefresh,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: 56,
          height: 56,
          background: "var(--surface-2)",
          border: "1px solid var(--pulse-border)",
        }}
      >
        <Icon
          style={{
            width: 24,
            height: 24,
            color: "var(--text-muted)",
            opacity: 0.6,
          }}
        />
      </div>
      <p
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          fontFamily: "var(--font-data)",
        }}
      >
        {message}
      </p>
      <p
        style={{
          fontSize: 11,
          color: "var(--text-muted)",
          fontFamily: "var(--font-data)",
        }}
      >
        {subtext}
      </p>
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="mt-1 rounded-md px-3 py-1 text-xs font-medium transition-all duration-200"
          style={{
            fontSize: 12,
            fontFamily: "var(--font-data)",
            color: "var(--brand)",
            background: "var(--brand-dim)",
            border: "1px solid var(--brand-border)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-dim)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--brand-dim)")}
        >
          Refresh
        </button>
      )}
    </div>
  );
}
