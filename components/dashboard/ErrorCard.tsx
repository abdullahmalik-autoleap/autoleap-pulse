"use client";

import { AlertTriangle, RotateCw } from "lucide-react";

interface ErrorCardProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorCard({
  message = "Failed to load data",
  onRetry,
}: ErrorCardProps) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3"
      style={{
        background: "var(--danger-dim)",
        border: "1px solid var(--danger-border)",
      }}
    >
      <AlertTriangle
        style={{
          width: 16,
          height: 16,
          color: "var(--danger)",
          flexShrink: 0,
        }}
      />
      <p
        style={{
          fontSize: 13,
          color: "var(--danger)",
          flex: 1,
          fontFamily: "var(--font-data)",
        }}
      >
        Failed to load · {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all duration-200"
          style={{
            background: "var(--danger-border)",
            color: "var(--danger)",
            border: "1px solid var(--danger-border)",
            fontFamily: "var(--font-data)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--danger-border)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--danger-border)")}
        >
          <RotateCw style={{ width: 12, height: 12 }} />
          Retry
        </button>
      )}
    </div>
  );
}
