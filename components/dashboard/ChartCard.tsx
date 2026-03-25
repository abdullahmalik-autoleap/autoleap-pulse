"use client";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  headerRight,
  children,
}: ChartCardProps) {
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
        <div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              style={{
                fontFamily: "var(--font-data)",
                fontSize: 11,
                color: "var(--text-muted)",
                marginTop: 2,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {headerRight && <div className="flex items-center gap-2">{headerRight}</div>}
      </div>
      <div style={{ marginTop: 16 }}>{children}</div>
    </div>
  );
}
