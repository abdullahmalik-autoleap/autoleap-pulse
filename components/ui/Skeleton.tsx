"use client";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = 6,
  className = "",
}: SkeletonProps) {
  return (
    <div
      className={`shimmer ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
}

export function KPICardSkeleton() {
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--pulse-border)",
        borderRadius: 12,
        padding: 20,
        height: 148,
      }}
    >
      <div className="flex items-center gap-2">
        <Skeleton width={18} height={18} borderRadius={4} />
        <Skeleton width={80} height={12} />
      </div>
      <div style={{ marginTop: 8 }}>
        <Skeleton width={100} height={32} />
      </div>
      <div style={{ marginTop: 10 }}>
        <Skeleton width={64} height={22} borderRadius={4} />
      </div>
    </div>
  );
}

export function ChartBlockSkeleton({ height = 260 }: { height?: number }) {
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
        <Skeleton width={140} height={18} />
        <Skeleton width={80} height={24} borderRadius={12} />
      </div>
      <Skeleton height={height} borderRadius={8} className="mt-4" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4" style={{ padding: "10px 0" }}>
      <Skeleton width="25%" height={14} />
      <Skeleton width="20%" height={14} />
      <Skeleton width="15%" height={14} />
      <Skeleton width="15%" height={14} />
      <Skeleton width="10%" height={14} />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--pulse-border)",
        borderRadius: 14,
        padding: 24,
      }}
    >
      <Skeleton width={140} height={18} />
      <div style={{ marginTop: 16 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
