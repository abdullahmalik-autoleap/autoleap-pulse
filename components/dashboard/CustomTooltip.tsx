"use client";

interface TooltipPayloadItem {
  dataKey: string;
  value: number;
  name: string;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  colorMap?: Record<string, string>;
}

export function CustomTooltip({
  active,
  payload,
  label,
  colorMap = {},
}: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: "#1A2B42",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        padding: "10px 14px",
        fontFamily: "var(--font-data)",
        fontSize: 12,
        animation: "fadeIn 150ms ease",
      }}
    >
      <p style={{ color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
      {payload.map((entry) => (
        <div
          key={entry.dataKey}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 3,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: colorMap[entry.dataKey] ?? entry.color ?? "var(--brand)",
              flexShrink: 0,
            }}
          />
          <span style={{ color: "var(--text-secondary)" }}>{entry.name}</span>
          <span style={{ color: "var(--text-primary)", fontWeight: 600, marginLeft: "auto" }}>
            {typeof entry.value === "number"
              ? entry.value.toLocaleString()
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}
