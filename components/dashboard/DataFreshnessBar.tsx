"use client";

interface DataFreshnessBarProps {
  progress: number;
}

export function DataFreshnessBar({ progress }: DataFreshnessBarProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: "var(--surface-2)",
        zIndex: 50,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.min(progress, 100)}%`,
          background: "var(--brand)",
          transition: progress === 0 ? "none" : "width 1s linear",
        }}
      />
    </div>
  );
}
