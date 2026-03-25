"use client";

interface ChartSkeletonProps {
  height?: number;
}

export function ChartSkeleton({ height = 260 }: ChartSkeletonProps) {
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--pulse-border)",
        borderRadius: 14,
        padding: 24,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="shimmer" style={{ width: 140, height: 18, borderRadius: 6 }} />
        <div className="shimmer" style={{ width: 80, height: 24, borderRadius: 12 }} />
      </div>
      <div
        className="shimmer"
        style={{
          marginTop: 16,
          height,
          borderRadius: 8,
        }}
      />
    </div>
  );
}
